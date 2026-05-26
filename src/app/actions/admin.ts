'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { loginsSinceDate } from '@/lib/user-logins'
import type { AdminUser, Profile } from '@/lib/types'

async function verifyAdmin(): Promise<{ userId: string; profile: Profile }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Не авторизован')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Доступ запрещён')
  }

  return { userId: user.id, profile: profile as Profile }
}

export async function getUsers(): Promise<Profile[]> {
  await verifyAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUsers error:', error)
    if (error.message.includes('profiles') || error.code === '42P01') {
      throw new Error(
        'Таблица profiles не найдена. Выполните .taskmaster/database-migration-auth.sql в Supabase.'
      )
    }
    throw new Error('Не удалось загрузить пользователей')
  }

  return (data ?? []) as Profile[]
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const users = await getUsers()
  const since = loginsSinceDate(30)

  let countMap = new Map<string, number>()

  try {
    const admin = createAdminClient()
    const { data: logins, error } = await admin
      .from('user_logins')
      .select('user_id')
      .gte('logged_in_at', since)

    if (error) {
      if (
        !error.message.includes('user_logins') &&
        error.code !== '42P01' &&
        !error.message.includes('schema cache')
      ) {
        console.error('getAdminUsers logins error:', error)
      }
    } else {
      for (const row of logins ?? []) {
        const id = row.user_id as string
        countMap.set(id, (countMap.get(id) ?? 0) + 1)
      }
    }
  } catch (err) {
    console.error('getAdminUsers logins error:', err)
  }

  return users.map((user) => ({
    ...user,
    logins_last_30_days: countMap.get(user.user_id) ?? 0,
  }))
}

export async function blockUser(targetUserId: string) {
  const { userId } = await verifyAdmin()

  if (targetUserId === userId) {
    throw new Error('Нельзя заблокировать себя')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'blocked' })
    .eq('user_id', targetUserId)

  if (error) {
    throw new Error('Не удалось заблокировать пользователя')
  }

  revalidatePath('/admin')
}

export async function unblockUser(targetUserId: string) {
  await verifyAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('user_id', targetUserId)

  if (error) {
    throw new Error('Не удалось разблокировать пользователя')
  }

  revalidatePath('/admin')
}

export async function deleteUser(targetUserId: string) {
  const { userId } = await verifyAdmin()

  if (targetUserId === userId) {
    throw new Error('Нельзя удалить себя')
  }

  const admin = createAdminClient()

  const { error: authError } = await admin.auth.admin.deleteUser(targetUserId)

  if (authError) {
    console.error('deleteUser auth error:', authError)
    throw new Error('Не удалось удалить пользователя')
  }

  revalidatePath('/admin')
  revalidatePath('/')
}
