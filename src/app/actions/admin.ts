'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile } from '@/lib/types'

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
    throw new Error('Не удалось загрузить пользователей')
  }

  return (data ?? []) as Profile[]
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
