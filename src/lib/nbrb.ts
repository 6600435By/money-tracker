import {
  type CurrencyCode,
  type ExchangeRates,
  type NbrbRate,
  createBynRate,
} from '@/lib/currency'

const NBRB_BASE = 'https://api.nbrb.by/exrates'
const TRACKED: CurrencyCode[] = ['USD', 'EUR', 'RUB']

interface NbrbApiRate {
  Cur_Abbreviation: string
  Cur_Scale: number
  Cur_OfficialRate: number
  Date: string
}

function mapRate(item: NbrbApiRate): NbrbRate {
  return {
    code: item.Cur_Abbreviation as CurrencyCode,
    scale: item.Cur_Scale,
    officialRate: item.Cur_OfficialRate,
    date: item.Date,
  }
}

/** Курсы на сегодня (periodicity=0) */
export async function fetchTodayRates(): Promise<ExchangeRates> {
  const response = await fetch(`${NBRB_BASE}/rates?periodicity=0`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`НБ РБ API: ${response.status}`)
  }

  const data = (await response.json()) as NbrbApiRate[]
  const date = data[0]?.Date ?? new Date().toISOString()
  const rates: ExchangeRates = {
    BYN: createBynRate(date),
    USD: { code: 'USD', scale: 1, officialRate: 0, date },
    EUR: { code: 'EUR', scale: 1, officialRate: 0, date },
    RUB: { code: 'RUB', scale: 100, officialRate: 0, date },
  }

  for (const item of data) {
    const code = item.Cur_Abbreviation as CurrencyCode
    if (TRACKED.includes(code)) {
      rates[code] = mapRate(item)
    }
  }

  return rates
}

/** Курс на дату (для пересчёта исторических транзакций) */
export async function fetchRateOnDate(
  currency: CurrencyCode,
  dateStr: string
): Promise<NbrbRate> {
  if (currency === 'BYN') {
    return createBynRate(dateStr)
  }

  const ondate = dateStr.split('T')[0]
  const response = await fetch(
    `${NBRB_BASE}/rates/${currency}?parammode=2&ondate=${ondate}`,
    { next: { revalidate: 86400 } }
  )

  if (!response.ok) {
    throw new Error(`НБ РБ API (${currency}): ${response.status}`)
  }

  const item = (await response.json()) as NbrbApiRate
  return mapRate(item)
}
