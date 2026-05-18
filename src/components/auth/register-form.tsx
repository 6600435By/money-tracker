'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import GoogleSignInButton from '@/components/auth/google-sign-in-button'
import AuthDivider from '@/components/auth/auth-divider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result?.success) {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Регистрация успешна</CardTitle>
          <CardDescription>
            Аккаунт создан. Теперь вы можете войти в систему.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/login">
            <Button className="w-full">Перейти ко входу</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт Money Tracker</CardDescription>
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
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Повторите пароль"
              autoComplete="new-password"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Регистрация…' : 'Зарегистрироваться'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
