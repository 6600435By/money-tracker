import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CurrencyConverter from '@/components/currency-converter'
import {
  CURRENCIES,
  type CurrencyCode,
  type ExchangeRates,
  formatRateToByn,
} from '@/lib/currency'
import { Banknote } from 'lucide-react'

const WIDGET_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'RUB']

interface ExchangeRatesContentProps {
  rates: ExchangeRates
}

export default function ExchangeRatesContent({ rates }: ExchangeRatesContentProps) {
  const date = rates.USD?.date
    ? new Date(rates.USD.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'сегодня'

  const hasRates = WIDGET_CURRENCIES.some((c) => rates[c].officialRate > 0)

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Banknote className="h-4 w-4 text-primary" />
          Курсы валют НБ РБ
        </CardTitle>
        <span className="text-xs text-muted-foreground">на {date}</span>
      </CardHeader>
      <CardContent>
        {!hasRates ? (
          <p className="text-sm text-muted-foreground">
            Не удалось загрузить курсы. Проверьте доступ к api.nbrb.by
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {WIDGET_CURRENCIES.map((code) => {
                const meta = CURRENCIES[code]
                const rate = rates[code]
                const perUnit = rate.officialRate / rate.scale

                return (
                  <div
                    key={code}
                    className="rounded-lg border bg-muted/40 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {meta.label} ({code})
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatRateToByn(rate)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      за {rate.scale === 1 ? '1' : rate.scale}{' '}
                      {code === 'USD' ? '$' : code === 'EUR' ? '€' : '₽'}
                      {rate.scale > 1 ? ` (${perUnit.toFixed(4)} Br/ед.)` : ''}
                    </p>
                  </div>
                )
              })}
            </div>
            <CurrencyConverter rates={rates} />
          </>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          Источник:{' '}
          <a
            href="https://www.nbrb.by/apihelp/exrates"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            API Национального банка Республики Беларусь
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
