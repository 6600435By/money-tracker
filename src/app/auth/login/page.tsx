import { Suspense } from 'react'
import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Загрузка…</div>}>
      <LoginForm />
    </Suspense>
  )
}
