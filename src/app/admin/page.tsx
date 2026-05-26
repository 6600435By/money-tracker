import Link from 'next/link'
import { getUserProfile } from '@/app/actions/auth'
import { getAdminUsers } from '@/app/actions/admin'
import { buildAdminStats } from '@/lib/admin-stats'
import UsersTable from '@/components/admin/users-table'
import AdminStatsCards from '@/components/admin/admin-stats'
import AccessDenied from '@/components/admin/access-denied'
import MigrationNotice from '@/components/admin/migration-notice'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function AdminPage() {
  const profile = await getUserProfile()

  if (!profile) {
    return (
      <AdminShell>
        <MigrationNotice message="Профиль пользователя не найден. Войдите в систему или выполните миграцию БД." />
      </AdminShell>
    )
  }

  if (profile.role !== 'admin') {
    return (
      <AdminShell>
        <AccessDenied />
      </AdminShell>
    )
  }

  try {
    const users = await getAdminUsers()
    const stats = buildAdminStats(users)

    return (
      <AdminShell>
        <AdminStatsCards stats={stats} />
        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-4">
            Пользователи
          </h2>
          <UsersTable users={users} currentUserId={profile.user_id} />
        </section>
      </AdminShell>
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Ошибка загрузки данных'

    return (
      <AdminShell>
        <MigrationNotice message={message} />
      </AdminShell>
    )
  }
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Администрирование
            </h1>
            <p className="text-muted-foreground mt-1">
              Управление пользователями Money Tracker
            </p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              К транзакциям
            </Button>
          </Link>
        </div>
        {children}
      </div>
    </main>
  )
}
