import { Suspense } from 'react'
import { getOrCreateProfile } from '@/lib/profile'
import { canUsePaidFeatures } from '@/lib/subscription'
import ExchangeRatesWidget from '@/components/exchange-rates-widget'
import SubscriptionBanner from '@/components/subscription-banner'
import HomeContent from './home-content'

export default async function Home() {
  const profile = await getOrCreateProfile()
  const showPaidFeatures = canUsePaidFeatures(profile)

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse">
            <div className="h-32 bg-muted rounded mb-8" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
      }
    >
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Suspense fallback={null}>
            <SubscriptionBanner />
          </Suspense>
          {showPaidFeatures && <ExchangeRatesWidget />}
          <HomeContent showPaidFeatures={showPaidFeatures} />
        </div>
      </main>
    </Suspense>
  )
}
