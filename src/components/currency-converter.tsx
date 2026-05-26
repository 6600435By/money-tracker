'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CURRENCIES,
  CURRENCY_CODES,
  type CurrencyCode,
  type ExchangeRates,
  convertCurrency,
  formatMoney,
} from '@/lib/currency'
import { ArrowLeftRight } from 'lucide-react'

interface CurrencyConverterProps {
  rates: ExchangeRates
}

export default function CurrencyConverter({ rates }: CurrencyConverterProps) {
  const [amountInput, setAmountInput] = useState('100')
  const [from, setFrom] = useState<CurrencyCode>('USD')
  const [to, setTo] = useState<CurrencyCode>('BYN')

  const result = useMemo(() => {
    const amount = parseFloat(amountInput.replace(',', '.'))
    if (!amount || amount <= 0 || Number.isNaN(amount)) return null
    return convertCurrency(amount, from, to, rates)
  }, [amountInput, from, to, rates])

  function swapCurrencies() {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <ArrowLeftRight className="h-4 w-4" />
        Калькулятор-конвертер
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_1fr_auto_1fr] gap-4 items-end">
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="conv-amount">Сумма</Label>
          <Input
            id="conv-amount"
            type="number"
            min="0"
            step="0.01"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label>Из</Label>
          <Select value={from} onValueChange={(v) => setFrom((v ?? 'BYN') as CurrencyCode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {CURRENCIES[code].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center pb-0.5">
          <Button type="button" variant="outline" size="icon" onClick={swapCurrencies}>
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Label>В</Label>
          <Select value={to} onValueChange={(v) => setTo((v ?? 'BYN') as CurrencyCode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {CURRENCIES[code].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {result !== null && (
        <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground">Результат по курсу НБ РБ</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatMoney(result, to)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {amountInput} {from} → {formatMoney(result, to)}
          </p>
        </div>
      )}
    </div>
  )
}
