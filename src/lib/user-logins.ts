import { createAdminClient } from '@/lib/supabase/admin'

/** Записать факт входа (вызывать после успешной аутентификации) */
export async function recordUserLogin(userId: string): Promise<void> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('user_logins').insert({ user_id: userId })

    if (error) {
      if (
        error.message.includes('user_logins') ||
        error.code === '42P01' ||
        error.message.includes('schema cache')
      ) {
        return
      }
      console.error('recordUserLogin error:', error)
    }
  } catch (err) {
    console.error('recordUserLogin error:', err)
  }
}

export function loginsSinceDate(days: number): string {
  const since = new Date()
  since.setDate(since.getDate() - days)
  return since.toISOString()
}
