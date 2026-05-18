'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from '@/app/actions/auth'
import GoogleSignInButton from '@/components/auth/google-sign-in-button'
import AuthDivider from '@/components/auth/auth-divider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Войдите в Money Tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleSignInButton />
        <AuthDivider />
        <form action={handleSubmit} className="space-y-4">
          <FormField label="Email">
            <Input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </FormField>
          <FormField label="Пароль">
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </FormField>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Вход…' : 'Войти'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
