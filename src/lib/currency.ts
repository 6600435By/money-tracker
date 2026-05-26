export const CURRENCY_CODES = ['BYN', 'USD', 'EUR', 'RUB'] as const
export type CurrencyCode = (typeof CURRENCY_CODES)[number]

export interface CurrencyMeta {
  code: CurrencyCode
  label: string
  symbol: string
  nbrbCode?: string
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  BYN: { code: 'BYN', label: 'Бел. рубль', symbol: 'Br' },
  USD: { code: 'USD', label: 'Доллар США', symbol: '$', nbrbCode: 'USD' },
  EUR: { code: 'EUR', label: 'Евро', symbol: '€', nbrbCode: 'EUR' },
  RUB: { code: 'RUB', label: 'Рос. рубль', symbol: '₽', nbrbCode: 'RUB' },
}

export interface NbrbRate {
  code: CurrencyCode
  scale: number
  officialRate: number
  date: string
}

export type ExchangeRates = Record<CurrencyCode, NbrbRate>

export function createBynRate(date: string): NbrbRate {
  return { code: 'BYN', scale: 1, officialRate: 1, date }
}

/** Сумма в BYN по официальному курсу НБ РБ */
export function convertToByn(
  amount: number,
  currency: CurrencyCode,
  rates: ExchangeRates
): number {
  if (currency === 'BYN') return amount
  const rate = rates[currency]
  if (!rate || rate.officialRate <= 0) return amount
  return (amount * rate.officialRate) / rate.scale
}

export function rateLookupKey(currency: CurrencyCode, date: string): string {
  return `${currency}:${date.split('T')[0]}`
}

export function convertToBynWithLookup(
  amount: number,
  currency: CurrencyCode,
  date: string,
  lookup: Record<string, NbrbRate>,
  fallback: ExchangeRates
): number {
  if (currency === 'BYN') return amount
  const key = rateLookupKey(currency, date)
  const rate = lookup[key] ?? fallback[currency]
  if (!rate || rate.officialRate <= 0) return amount
  return (amount * rate.officialRate) / rate.scale
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  if (currency === 'BYN') {
    return (
      new Intl.NumberFormat('ru-BY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + ' Br'
    )
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatRateToByn(rate: NbrbRate): string {
  if (rate.code === 'BYN') return '1 Br'
  const perUnit = rate.officialRate / rate.scale
  return `${perUnit.toFixed(4)} Br`
}

/** Пересчёт между любыми валютами через BYN по курсу НБ РБ */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates
): number {
  if (from === to) return amount
  const inByn = convertToByn(amount, from, rates)
  if (to === 'BYN') return inByn
  const toRate = rates[to]
  if (!toRate || toRate.officialRate <= 0) return 0
  return inByn / (toRate.officialRate / toRate.scale)
}

export interface WalletBalance {
  currency: CurrencyCode
  income: number
  expenses: number
  balance: number
  transactionCount: number
}

export function computeWalletBalances(
  transactions: { amount: number; currency?: CurrencyCode; type: 'income' | 'expense' }[]
): WalletBalance[] {
  return CURRENCY_CODES.map((currency) => {
    const walletTx = transactions.filter((t) => (t.currency ?? 'BYN') === currency)
    const income = walletTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const expenses = walletTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    return {
      currency,
      income,
      expenses,
      balance: income - expenses,
      transactionCount: walletTx.length,
    }
  })
}
