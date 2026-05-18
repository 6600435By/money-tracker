import Link from 'next/link'
import { getUserProfile, signOut } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function NavBar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await getUserProfile()
  const email = profile?.email ?? user.email ?? ''
  const isAdmin = profile?.role === 'admin'

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors">
          Money Tracker
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Админ-панель
            </Link>
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">{email}</span>
          {!profile && (
            <span className="text-xs text-amber-600 hidden md:inline">
              Профиль не загружен
            </span>
          )}
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Выйти
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
