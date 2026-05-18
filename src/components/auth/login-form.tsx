'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from '@/app/actions/auth'
import GoogleSignInButton from '@/components/auth/google-sign-in-button'
import AuthDivider from '@/components/auth/auth-divider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function getInitialError(searchParams: URLSearchParams): string | null {
  if (searchParams.get('blocked') === '1') {
    return 'Ваш аккаунт заблокирован'
  }
  if (searchParams.get('error') === 'oauth') {
    return 'Не удалось войти через Google. Попробуйте снова.'
  }
  return null
}

export default function LoginForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(getInitialError(searchParams))
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">Вход</CardTitle>
        <CardDescription>Войдите в Money Tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleSignInButton />
        <AuthDivider />
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Вход…' : 'Войти'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
