import Link from 'next/link'
import { Suspense } from 'react'
import { getUserProfile, signOut } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import WeatherWidget from '@/components/weather-widget'
import CheckoutButton from '@/components/subscription/checkout-button'
import ManageSubscriptionButton from '@/components/subscription/manage-subscription-button'
import RefreshSubscriptionButton from '@/components/subscription/refresh-subscription-button'
import {
  getEffectivePlan,
  hasActiveProSubscription,
  isAdmin,
  shouldShowProButton,
  subscriptionBadgeLabel,
} from '@/lib/subscription'

export default async function NavBar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await getUserProfile()
  const email = profile?.email ?? user.email ?? ''
  const admin = isAdmin(profile)
  const proActive = hasActiveProSubscription(profile)
  const showProButton = shouldShowProButton(profile)

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors shrink-0"
        >
          Money Tracker
        </Link>
        <div className="flex-1 flex justify-center min-w-0 overflow-hidden">
          <Suspense fallback={null}>
            <WeatherWidget />
          </Suspense>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap justify-end">
          {admin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Админ
            </Link>
          )}

          {profile && !admin && (
            <Badge variant={proActive ? 'default' : 'outline'}>
              {subscriptionBadgeLabel(getEffectivePlan(profile))}
            </Badge>
          )}

          {showProButton && (
            <>
              <CheckoutButton
                size="sm"
                variant="default"
                label="Pro $10"
                className="font-semibold shadow-sm"
              />
              <RefreshSubscriptionButton />
            </>
          )}

          {profile?.stripe_customer_id && proActive && !admin && (
            <ManageSubscriptionButton />
          )}

          <span className="text-sm text-muted-foreground hidden md:inline max-w-[140px] truncate">
            {email}
          </span>

          {!profile && (
            <span className="text-xs text-amber-600 hidden lg:inline">
              Профиль не загружен
            </span>
          )}

          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Выйти
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
