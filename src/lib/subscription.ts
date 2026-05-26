import type { Profile, SubscriptionPlan } from '@/lib/types'

export const SUBSCRIPTION_PLANS = ['free', 'pro', 'family'] as const

export const PAID_FEATURES = {
  exchange_rates: 'exchange_rates',
  currency_converter: 'currency_converter',
  csv_export: 'csv_export',
} as const

export type PaidFeature = (typeof PAID_FEATURES)[keyof typeof PAID_FEATURES]

const PRO_PLANS: SubscriptionPlan[] = ['pro', 'family']

const ACTIVE_STRIPE_STATUSES = new Set(['active', 'trialing'])

const FEATURE_MESSAGES: Record<PaidFeature, string> = {
  exchange_rates:
    'Виджет курсов валют НБ РБ доступен по подписке Pro ($10/мес).',
  currency_converter:
    'Калькулятор-конвертер валют доступен по подписке Pro ($10/мес).',
  csv_export:
    'Экспорт транзакций в CSV доступен по подписке Pro ($10/мес).',
}

export function getEffectivePlan(profile: Profile | null): SubscriptionPlan {
  return profile?.plan ?? 'free'
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin'
}

export function hasActiveProSubscription(profile: Profile | null): boolean {
  if (!profile) return false
  if (isAdmin(profile)) return true

  const plan = getEffectivePlan(profile)
  if (!PRO_PLANS.includes(plan)) return false

  if (profile.subscription_status) {
    return ACTIVE_STRIPE_STATUSES.has(profile.subscription_status)
  }

  return true
}

/** Платные функции: только admin или активная подписка Pro */
export function canUsePaidFeatures(profile: Profile | null): boolean {
  return hasActiveProSubscription(profile)
}

export function canUsePaidFeature(
  profile: Profile | null,
  feature: PaidFeature
): boolean {
  void feature
  return canUsePaidFeatures(profile)
}

export type FeatureAccess =
  | { allowed: true }
  | { allowed: false; code: 'SUBSCRIPTION_REQUIRED'; message: string }

export function getFeatureAccess(
  profile: Profile | null,
  feature: PaidFeature
): FeatureAccess {
  if (canUsePaidFeature(profile, feature)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    code: 'SUBSCRIPTION_REQUIRED',
    message: FEATURE_MESSAGES[feature],
  }
}

export function getCsvExportAccess(profile: Profile | null): FeatureAccess {
  return getFeatureAccess(profile, PAID_FEATURES.csv_export)
}

export function shouldShowProButton(profile: Profile | null): boolean {
  if (!profile) return false
  if (isAdmin(profile)) return false
  return !hasActiveProSubscription(profile)
}

export function subscriptionBadgeLabel(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'pro':
      return 'Pro'
    case 'family':
      return 'Family'
    default:
      return 'Free'
  }
}

export const PRO_FEATURE_LIST = [
  'Курсы валют НБ РБ на главной',
  'Калькулятор-конвертер валют',
  'Экспорт транзакций в CSV',
] as const
