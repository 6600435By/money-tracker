import { getExchangeRates } from '@/app/actions/exchange-rates'
import { getOrCreateProfile } from '@/lib/profile'
import { canUsePaidFeatures } from '@/lib/subscription'
import ExchangeRatesContent from '@/components/exchange-rates-content'

/** Виджет курсов и конвертер — только Pro или admin */
export default async function ExchangeRatesWidget() {
  const profile = await getOrCreateProfile()

  if (!canUsePaidFeatures(profile)) {
    return null
  }

  const rates = await getExchangeRates()
  return <ExchangeRatesContent rates={rates} />
}
