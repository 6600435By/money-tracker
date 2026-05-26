import UserActions from './user-actions'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatPaymentSummary,
  formatPlanLabel,
  formatSubscriptionPeriodEnd,
  formatSubscriptionStatus,
} from '@/lib/admin-subscription'
import { hasActiveProSubscription } from '@/lib/subscription'
import type { AdminUser, Profile } from '@/lib/types'

interface UsersTableProps {
  users: AdminUser[]
  currentUserId: string
}

function RoleBadge({ role }: { role: Profile['role'] }) {
  if (role === 'admin') {
    return (
      <Badge variant="default" className="bg-primary text-primary-foreground">
        Админ
      </Badge>
    )
  }
  return <Badge variant="secondary">Пользователь</Badge>
}

function StatusBadge({ status }: { status: Profile['status'] }) {
  if (status === 'blocked') {
    return <Badge variant="destructive">Заблокирован</Badge>
  }
  return (
    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
      Активен
    </Badge>
  )
}

function PlanBadge({ user }: { user: AdminUser }) {
  const plan = user.plan ?? 'free'
  const active = hasActiveProSubscription(user)

  if (plan === 'pro' || plan === 'family') {
    return (
      <Badge
        variant={active ? 'default' : 'secondary'}
        className={active ? 'bg-primary text-primary-foreground' : undefined}
      >
        {formatPlanLabel(plan)}
      </Badge>
    )
  }

  return <Badge variant="outline">{formatPlanLabel(plan)}</Badge>
}

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>План</TableHead>
            <TableHead>Оплата</TableHead>
            <TableHead>Подписка до</TableHead>
            <TableHead className="text-right">Входов за 30 дн.</TableHead>
            <TableHead>Регистрация</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell className="font-medium whitespace-nowrap">
                {user.email}
              </TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <StatusBadge status={user.status} />
              </TableCell>
              <TableCell>
                <PlanBadge user={user} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                <span title={formatPaymentSummary(user)}>
                  {user.subscription_status
                    ? formatSubscriptionStatus(user.subscription_status)
                    : user.plan === 'pro' || user.plan === 'family'
                      ? 'Без статуса Stripe'
                      : '—'}
                </span>
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap">
                {formatSubscriptionPeriodEnd(user.subscription_period_end)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {user.logins_last_30_days}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                {new Date(user.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <UserActions user={user} currentUserId={currentUserId} />
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-8 text-muted-foreground"
              >
                Пользователей пока нет
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
