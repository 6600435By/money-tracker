import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined
  let v = value.trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim()
  }
  return v || undefined
}

/** Secret / service_role ключ для обхода RLS (обновление plan после Stripe) */
export function getSupabaseAdminKey(): string | undefined {
  return (
    normalizeEnvValue(process.env.SUPABASE_SECRET_KEY) ??
    normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY)
  )
}

export function createAdminClient(): SupabaseClient {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceRoleKey = getSupabaseAdminKey()

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL не задан в .env.local')
  }

  if (!serviceRoleKey || serviceRoleKey === 'your_supabase_service_role_key') {
    throw new Error(
      'Добавьте SUPABASE_SERVICE_ROLE_KEY (или SUPABASE_SECRET_KEY) в .env.local — Supabase → Project Settings → API Keys → service_role / Secret key.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function verifySupabaseAdminClient(): Promise<
  { ok: true } | { error: string }
> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('profiles').select('id').limit(1)
    if (error) {
      if (error.message.includes('Invalid API key')) {
        return {
          error:
            'Неверный SUPABASE_SERVICE_ROLE_KEY. В Supabase откройте Settings → API Keys и скопируйте актуальный service_role secret (eyJ… или sb_secret_…) в .env.local, затем перезапустите npm run dev.',
        }
      }
      return { error: error.message }
    }
    return { ok: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Ошибка подключения к Supabase Admin',
    }
  }
}
