import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { stripePeriodEndFromUnix } from '@/lib/admin-subscription'
import {
  proUpdateFromStripeSubscription,
  subscriptionCurrentPeriodEndUnix,
} from '@/lib/stripe-subscription'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

async function updateProfileByUserId(
  userId: string,
  data: Record<string, unknown>
) {
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update(data).eq('user_id', userId)
  if (error) {
    console.error('Stripe webhook profile update error:', error)
    throw error
  }
}

async function updateProfileByCustomerId(
  customerId: string,
  data: Record<string, unknown>
) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update(data)
    .eq('stripe_customer_id', customerId)
  if (error) {
    console.error('Stripe webhook profile update by customer error:', error)
    throw error
  }
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const userId = subscription.metadata?.supabase_user_id
  const payload = proUpdateFromStripeSubscription(subscription, customerId)

  if (userId) {
    await updateProfileByUserId(userId, payload)
  } else {
    await updateProfileByCustomerId(customerId, payload)
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET не настроен' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Stripe webhook signature error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.supabase_user_id
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id

        if (!userId || !customerId) break

        let periodEnd: string | null = null
        if (subscriptionId) {
          try {
            const stripe = getStripe()
            const sub = await stripe.subscriptions.retrieve(subscriptionId)
            periodEnd = stripePeriodEndFromUnix(
              subscriptionCurrentPeriodEndUnix(sub)
            )
          } catch {
            periodEnd = null
          }
        }

        await updateProfileByUserId(userId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId ?? null,
          plan: 'pro',
          subscription_status: 'active',
          subscription_period_end: periodEnd,
        })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(subscription)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
