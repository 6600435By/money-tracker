import Link from 'next/link'
import { getUserProfile, signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default async function NavBar() {
  const profile = await getUserProfile()

  if (!profile) return null

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
          Money Tracker
        </Link>
        <div className="flex items-center gap-4">
          {profile.role === 'admin' && (
            <Link
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Админ-панель
            </Link>
          )}
          <span className="text-sm text-gray-600 hidden sm:inline">{profile.email}</span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Выйти
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
