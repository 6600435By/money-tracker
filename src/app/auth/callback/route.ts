import { createClient } from '@/lib/supabase/server'
import { recordUserLogin } from '@/lib/user-logins'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (profile?.status === 'blocked') {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/auth/login?blocked=1`)
    }

    await recordUserLogin(user.id)
  }

  return NextResponse.redirect(`${origin}/`)
}
