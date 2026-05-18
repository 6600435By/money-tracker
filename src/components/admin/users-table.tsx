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
import type { Profile } from '@/lib/types'

interface UsersTableProps {
  users: Profile[]
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
  return (
    <Badge variant="secondary">
      Пользователь
    </Badge>
  )
}

function StatusBadge({ status }: { status: Profile['status'] }) {
  if (status === 'blocked') {
    return (
      <Badge variant="destructive">
        Заблокирован
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
      Активен
    </Badge>
  )
}

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата регистрации</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <StatusBadge status={user.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
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
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Пользователей пока нет
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
