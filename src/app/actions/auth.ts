'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateProfile } from '@/lib/profile'
import type { Profile } from '@/lib/types'

const signInSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
})

const signUpSchema = z
  .object({
    email: z.string().email('Введите корректный email'),
    password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export async function getUserProfile(): Promise<Profile | null> {
  return getOrCreateProfile()
}

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Неверные данные' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Неверный email или пароль' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('user_id', data.user.id)
    .single()

  if (profile?.status === 'blocked') {
    await supabase.auth.signOut()
    return { error: 'Ваш аккаунт заблокирован' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Неверные данные' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}
