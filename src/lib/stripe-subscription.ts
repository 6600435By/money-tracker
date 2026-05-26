import type Stripe from 'stripe'
import { stripePeriodEndFromUnix } from '@/lib/admin-subscription'
import type { SubscriptionStatus } from '@/lib/types'

export type ProSubscriptionUpdate = {
  stripe_customer_id: string
  stripe_subscription_id: string | null
  plan: 'pro' | 'free'
  subscription_status: SubscriptionStatus | string
  subscription_period_end?: string | null
}

export function mapProfileSubscriptionDbError(message: string): string {
  if (message.includes('Invalid API key')) {
    return (
      'Неверный ключ Supabase Admin (SUPABASE_SERVICE_ROLE_KEY). ' +
      'Supabase → Settings → API Keys → service_role / Secret key → вставьте в .env.local и перезапустите npm run dev.'
    )
  }
  if (
    message.includes('plan') ||
    message.includes('stripe_customer') ||
    message.includes('subscription_status') ||
    message.includes('subscription_period_end') ||
    message.includes('schema cache')
  ) {
    return 'Выполните SQL-миграцию в Supabase: .taskmaster/database-migration-subscription.sql'
  }
  return message
}

/** Конец текущего периода в Unix-секундах (в актуальных типах Stripe — на subscription items). */
export function subscriptionCurrentPeriodEndUnix(
  subscription: Stripe.Subscription
): number | null {
  const items = subscription.items?.data
  if (!items?.length) return null
  let max: number | null = null
  for (const item of items) {
    if (typeof item.current_period_end === 'number') {
      max =
        max === null
          ? item.current_period_end
          : Math.max(max, item.current_period_end)
    }
  }
  return max
}

export function proUpdateFromStripeSubscription(
  subscription: Stripe.Subscription,
  customerId: string
): ProSubscriptionUpdate {
  const active =
    subscription.status === 'active' || subscription.status === 'trialing'

  return {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan: active ? 'pro' : 'free',
    subscription_status: subscription.status,
    subscription_period_end: stripePeriodEndFromUnix(
      subscriptionCurrentPeriodEndUnix(subscription)
    ),
  }
}

export function isCheckoutSessionPaid(
  paymentStatus: string | null,
  status: string | null
): boolean {
  return paymentStatus === 'paid' || status === 'complete'
}
