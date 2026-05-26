'use server'

import { revalidatePath } from 'next/cache'
import { getOrCreateProfile } from '@/lib/profile'
import { createAdminClient, verifySupabaseAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import {
  formatStripeAuthError,
  getAppBaseUrl,
  getStripe,
  getStripeSecretKey,
  isStripeCheckoutReady,
  resolveProPriceId,
} from '@/lib/stripe'
import { stripePeriodEndFromUnix } from '@/lib/admin-subscription'
import {
  isCheckoutSessionPaid,
  mapProfileSubscriptionDbError,
  proUpdateFromStripeSubscription,
  type ProSubscriptionUpdate,
} from '@/lib/stripe-subscription'
import { hasActiveProSubscription, isAdmin } from '@/lib/subscription'

type ActionSuccess<T> = T
type ActionError = { error: string }

async function applyProSubscriptionToProfile(
  userId: string,
  data: ProSubscriptionUpdate
): Promise<{ ok: true } | { error: string }> {
  const adminCheck = await verifySupabaseAdminClient()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update(data).eq('user_id', userId)

  if (error) {
    console.error('applyProSubscriptionToProfile error:', error)
    return { error: mapProfileSubscriptionDbError(error.message) }
  }

  revalidatePath('/')
  return { ok: true }
}

export async function createProCheckoutSession(): Promise<
  ActionSuccess<{ url: string }> | ActionError
> {
  try {
    if (!getStripeSecretKey()) {
      return {
        error:
          'Добавьте STRIPE_SECRET_KEY в .env.local (Stripe Dashboard → API keys → Secret key).',
      }
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Неверная настройка Stripe.',
    }
  }

  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: 'Войдите в аккаунт, чтобы оформить подписку.' }
  }

  if (isAdmin(profile) || hasActiveProSubscription(profile)) {
    return { error: 'У вас уже есть доступ к Pro.' }
  }

  try {
    const stripe = getStripe()
    const priceId = await resolveProPriceId(stripe)
    const baseUrl = await getAppBaseUrl()
    let customerId = profile.stripe_customer_id ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { supabase_user_id: profile.user_id },
      })
      customerId = customer.id

      const admin = createAdminClient()
      const { error: customerSaveError } = await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', profile.user_id)

      if (customerSaveError) {
        return {
          error: mapProfileSubscriptionDbError(customerSaveError.message),
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?subscription=canceled`,
      metadata: { supabase_user_id: profile.user_id },
      subscription_data: {
        metadata: { supabase_user_id: profile.user_id },
      },
      allow_promotion_codes: true,
    })

    if (!session.url) {
      return { error: 'Не удалось создать сессию оплаты Stripe.' }
    }

    return { url: session.url }
  } catch (err) {
    console.error('createProCheckoutSession error:', err)
    if (
      err instanceof Stripe.errors.StripeAuthenticationError ||
      (err instanceof Error && err.message.includes('Invalid API Key'))
    ) {
      return { error: formatStripeAuthError() }
    }
    const message =
      err instanceof Error ? err.message : 'Ошибка Stripe при создании оплаты'
    return { error: message }
  }
}

export async function createBillingPortalSession(): Promise<
  ActionSuccess<{ url: string }> | ActionError
> {
  if (!isStripeCheckoutReady()) {
    return { error: 'Stripe не настроен.' }
  }

  const profile = await getOrCreateProfile()
  if (!profile?.stripe_customer_id) {
    return { error: 'Сначала оформите подписку Pro.' }
  }

  try {
    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: await getAppBaseUrl(),
    })
    return { url: session.url }
  } catch (err) {
    console.error('createBillingPortalSession error:', err)
    return { error: 'Не удалось открыть портал подписки.' }
  }
}

/**
 * Активирует Pro после оплаты.
 * Предпочтительно передать checkoutSessionId из ?session_id=…
 */
export async function syncProSubscriptionAfterPayment(
  checkoutSessionId?: string
): Promise<ActionSuccess<{ synced: boolean }> | ActionError> {
  if (!isStripeCheckoutReady()) {
    return { error: 'Stripe не настроен.' }
  }

  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: 'Не авторизован.' }
  }

  if (isAdmin(profile) || hasActiveProSubscription(profile)) {
    revalidatePath('/')
    return { synced: true }
  }

  try {
    const stripe = getStripe()

    if (checkoutSessionId?.trim()) {
      const synced = await syncFromCheckoutSession(
        stripe,
        checkoutSessionId.trim(),
        profile.user_id,
        profile.email
      )
      if (synced === 'ok') return { synced: true }
      if (synced === 'wrong_user') {
        return { error: 'Сессия оплаты принадлежит другому аккаунту.' }
      }
    }

    let customerId = profile.stripe_customer_id ?? null

    if (!customerId) {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 5,
      })
      const match =
        customers.data.find(
          (c) => c.metadata?.supabase_user_id === profile.user_id
        ) ?? customers.data[0]
      customerId = match?.id ?? null
    }

    if (!customerId) {
      return {
        error:
          'Не найден клиент Stripe. Подождите минуту и обновите страницу или напишите в поддержку.',
      }
    }

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    })

    const active = subs.data.find(
      (s) => s.status === 'active' || s.status === 'trialing'
    )

    if (!active) {
      const incomplete = subs.data.find((s) =>
        ['incomplete', 'past_due', 'unpaid'].includes(s.status)
      )
      return {
        error: incomplete
          ? `Подписка в статусе «${incomplete.status}». Проверьте оплату в Stripe.`
          : 'Активная подписка не найдена. Оплатите Pro или нажмите ↻ после успешной оплаты.',
      }
    }

    const applied = await applyProSubscriptionToProfile(
      profile.user_id,
      proUpdateFromStripeSubscription(active, customerId)
    )

    if ('error' in applied) {
      return { error: applied.error }
    }

    return { synced: true }
  } catch (err) {
    console.error('syncProSubscriptionAfterPayment error:', err)
    return { error: 'Не удалось синхронизировать подписку.' }
  }
}

async function syncFromCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  userId: string,
  email: string
): Promise<'ok' | 'wrong_user' | 'not_paid' | 'not_found'> {
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })
  } catch {
    return 'not_found'
  }

  const paid =
    isCheckoutSessionPaid(session.payment_status, session.status) ||
    session.status === 'complete'

  if (!paid) {
    return 'not_paid'
  }

  const metaUserId = session.metadata?.supabase_user_id
  if (metaUserId && metaUserId !== userId) {
    return 'wrong_user'
  }

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id

  if (!customerId) {
    return 'not_found'
  }

  const sub = session.subscription
  let subscriptionId: string | null = null
  let subscriptionStatus = 'active'

  let periodEnd: string | null = null

  if (typeof sub === 'string') {
    subscriptionId = sub
    try {
      const full = await stripe.subscriptions.retrieve(sub)
      subscriptionStatus = full.status
      periodEnd = stripePeriodEndFromUnix(full.current_period_end)
    } catch {
      subscriptionStatus = 'active'
    }
  } else if (sub && typeof sub === 'object') {
    subscriptionId = sub.id
    subscriptionStatus = sub.status
    periodEnd = stripePeriodEndFromUnix(sub.current_period_end)
  }

  // Оплата прошла — активируем Pro даже если объект subscription ещё не подтянулся
  const plan =
    subscriptionStatus === 'active' ||
    subscriptionStatus === 'trialing' ||
    session.payment_status === 'paid'
      ? 'pro'
      : 'free'

  if (plan !== 'pro') {
    return 'not_paid'
  }

  const targetUserId = metaUserId ?? userId
  const applied = await applyProSubscriptionToProfile(targetUserId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan: 'pro',
    subscription_status:
      subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
        ? subscriptionStatus
        : 'active',
    subscription_period_end: periodEnd,
  })

  if ('error' in applied) {
    throw new Error(applied.error)
  }

  void email
  return 'ok'
}

/** Ручная проверка статуса подписки (кнопка в шапке) */
export async function refreshSubscriptionStatus(): Promise<
  ActionSuccess<{ hasPro: boolean }> | ActionError
> {
  const result = await syncProSubscriptionAfterPayment()
  if ('error' in result) {
    return { error: result.error }
  }

  const profile = await getOrCreateProfile()
  return { hasPro: hasActiveProSubscription(profile) }
}
