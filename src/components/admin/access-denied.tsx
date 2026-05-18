import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AccessDenied() {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Доступ запрещён</CardTitle>
        <CardDescription>
          Админ-панель доступна только пользователям с ролью{' '}
          <code className="text-sm bg-muted px-1 rounded">admin</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Чтобы назначить себя администратором, выполните в Supabase SQL Editor:
        </p>
        <p className="text-sm text-muted-foreground">
          Сначала выполните{' '}
          <code className="text-xs bg-muted px-1 rounded">
            .taskmaster/database-fix-profiles-rls.sql
          </code>{' '}
          в Supabase, затем:
        </p>
        <pre className="text-xs bg-foreground text-background p-4 rounded-lg overflow-x-auto">
{`UPDATE profiles
SET role = 'admin'
WHERE email = 'ваш@email.com';`}
        </pre>
        <Link href="/">
          <Button variant="outline" className="w-full">
            На главную
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
