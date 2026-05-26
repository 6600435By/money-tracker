import { hasActiveProSubscription } from '@/lib/subscription'
import type { AdminUser } from '@/lib/types'

export interface AdminStats {
  total: number
  active: number
  blocked: number
  admins: number
  proSubscribers: number
  loginsLast30Days: number
}

export function buildAdminStats(users: AdminUser[]): AdminStats {
  return {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    blocked: users.filter((u) => u.status === 'blocked').length,
    admins: users.filter((u) => u.role === 'admin').length,
    proSubscribers: users.filter((u) => hasActiveProSubscription(u)).length,
    loginsLast30Days: users.reduce((sum, u) => sum + u.logins_last_30_days, 0),
  }
}
