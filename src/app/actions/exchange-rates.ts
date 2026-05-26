'use server'

import {
  type CurrencyCode,
  type ExchangeRates,
  type NbrbRate,
  createBynRate,
  rateLookupKey,
} from '@/lib/currency'
import { fetchRateOnDate, fetchTodayRates } from '@/lib/nbrb'

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    return await fetchTodayRates()
  } catch (error) {
    console.error('getExchangeRates error:', error)
    const date = new Date().toISOString()
    return {
      BYN: createBynRate(date),
      USD: { code: 'USD', scale: 1, officialRate: 0, date },
      EUR: { code: 'EUR', scale: 1, officialRate: 0, date },
      RUB: { code: 'RUB', scale: 100, officialRate: 0, date },
    }
  }
}

/** Курсы на даты транзакций для точного пересчёта в BYN */
export async function getRatesLookup(
  items: { currency: CurrencyCode; date: string }[]
): Promise<Record<string, NbrbRate>> {
  const today = await getExchangeRates()
  const lookup: Record<string, NbrbRate> = {}

  const keys = new Set<string>()
  for (const item of items) {
    if (item.currency === 'BYN') continue
    keys.add(rateLookupKey(item.currency, item.date))
  }

  await Promise.all(
    [...keys].map(async (key) => {
      const [currency, date] = key.split(':') as [CurrencyCode, string]
      try {
        lookup[key] = await fetchRateOnDate(currency, date)
      } catch {
        lookup[key] = today[currency]
      }
    })
  )

  return lookup
}
