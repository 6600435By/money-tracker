import { redirect } from 'next/navigation'
import { getUserProfile } from '@/app/actions/auth'
import { getUsers } from '@/app/actions/admin'
import UsersTable from '@/components/admin/users-table'

export default async function AdminPage() {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const users = await getUsers()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление пользователями
        </h1>
        <p className="text-gray-600 mb-8">
          Блокировка, разблокировка и удаление зарегистрированных пользователей
        </p>
        <UsersTable users={users} currentUserId={profile.user_id} />
      </div>
    </main>
  )
}
