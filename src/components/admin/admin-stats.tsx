import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CreditCard,
  LogIn,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react'
import type { AdminStats } from '@/lib/admin-stats'

interface AdminStatsProps {
  stats: AdminStats
}

const cards = (stats: AdminStats) => [
  {
    label: 'Всего пользователей',
    value: stats.total,
    icon: Users,
    color: 'text-foreground',
  },
  {
    label: 'Активных',
    value: stats.active,
    icon: UserCheck,
    color: 'text-emerald-600',
  },
  {
    label: 'Заблокированных',
    value: stats.blocked,
    icon: UserX,
    color: 'text-rose-600',
  },
  {
    label: 'Администраторов',
    value: stats.admins,
    icon: ShieldCheck,
    color: 'text-primary',
  },
  {
    label: 'Подписчиков Pro',
    value: stats.proSubscribers,
    icon: CreditCard,
    color: 'text-primary',
  },
  {
    label: 'Входов за 30 дней',
    value: stats.loginsLast30Days,
    icon: LogIn,
    color: 'text-foreground',
  },
]

export default function AdminStatsCards({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {cards(stats).map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-semibold tracking-tight text-balance-display ${card.color}`}
              >
                {card.value}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
