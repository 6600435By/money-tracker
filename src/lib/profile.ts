import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export async function getOrCreateProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return existing as Profile

  const { data: created, error } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      email: user.email ?? '',
    })
    .select('*')
    .single()

  if (error) {
    console.error('getOrCreateProfile insert error:', error)
    return null
  }

  return created as Profile
}
