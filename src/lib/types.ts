import type { CurrencyCode } from '@/lib/currency'

export interface Transaction {
  id: string
  amount: number
  currency: CurrencyCode
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
  created_at: string
  user_id?: string
}

export interface CreateTransactionData {
  amount: number
  currency: CurrencyCode
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: string
}

export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'blocked'
export type SubscriptionPlan = 'free' | 'pro' | 'family'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

export interface Profile {
  id: number
  user_id: string
  email: string
  role: UserRole
  status: UserStatus
  /** План подписки; по умолчанию free. Требует database-migration-subscription.sql */
  plan?: SubscriptionPlan
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  subscription_status?: SubscriptionStatus | string | null
  /** Конец текущего оплаченного периода (Stripe). Требует database-migration-admin-analytics.sql */
  subscription_period_end?: string | null
  created_at: string
}

export interface AdminUser extends Profile {
  logins_last_30_days: number
}

/** @deprecated Используйте getCategories() или ALL_DEFAULT_CATEGORIES из @/lib/categories */
export { ALL_DEFAULT_CATEGORIES as CATEGORIES } from '@/lib/categories'

export type Category = string
