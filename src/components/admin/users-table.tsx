import UserActions from './user-actions'
import type { Profile } from '@/lib/types'

interface UsersTableProps {
  users: Profile[]
  currentUserId: string
}

function RoleBadge({ role }: { role: Profile['role'] }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Админ
      </span>
    )
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      Пользователь
    </span>
  )
}

function StatusBadge({ status }: { status: Profile['status'] }) {
  if (status === 'blocked') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Заблокирован
      </span>
    )
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Активен
    </span>
  )
}

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Роль</th>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Статус</th>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Дата регистрации</th>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-gray-900">{user.email}</td>
              <td className="px-4 py-3">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(user.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <UserActions user={user} currentUserId={currentUserId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="px-4 py-8 text-center text-gray-500">Пользователей пока нет</p>
      )}
    </div>
  )
}
