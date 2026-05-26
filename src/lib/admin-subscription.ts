import type { Profile, SubscriptionPlan, SubscriptionStatus } from '@/lib/types'

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: 'Бесплатный',
  pro: 'Pro',
  family: 'Family',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Оплачена',
  trialing: 'Пробный период',
  past_due: 'Просрочена',
  canceled: 'Отменена',
  unpaid: 'Не оплачена',
  incomplete: 'Не завершена',
  incomplete_expired: 'Истекла',
  paused: 'Приостановлена',
}

export function formatPlanLabel(plan?: SubscriptionPlan | null): string {
  return PLAN_LABELS[plan ?? 'free'] ?? 'Бесплатный'
}

export function formatSubscriptionStatus(
  status?: SubscriptionStatus | string | null
): string {
  if (!status) return '—'
  return STATUS_LABELS[status] ?? status
}

export function formatSubscriptionPeriodEnd(
  iso: string | null | undefined
): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPaymentSummary(user: Profile): string {
  const plan = formatPlanLabel(user.plan)
  const status = user.subscription_status
    ? formatSubscriptionStatus(user.subscription_status)
    : user.plan === 'pro' || user.plan === 'family'
      ? 'Без Stripe'
      : '—'

  if (user.plan === 'free' && !user.stripe_subscription_id) {
    return `${plan} · без оплаты`
  }

  return `${plan} · ${status}`
}

export function stripePeriodEndFromUnix(seconds: number | null | undefined): string | null {
  if (!seconds) return null
  return new Date(seconds * 1000).toISOString()
}
