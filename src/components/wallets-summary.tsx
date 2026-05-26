'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/lib/types'
import {
  CURRENCIES,
  CURRENCY_CODES,
  type CurrencyCode,
  computeWalletBalances,
  formatMoney,
} from '@/lib/currency'
import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletsSummaryProps {
  transactions: Transaction[]
}

const WALLET_COLORS: Record<CurrencyCode, string> = {
  BYN: 'border-emerald-500/50 bg-emerald-500/5',
  USD: 'border-blue-500/50 bg-blue-500/5',
  EUR: 'border-violet-500/50 bg-violet-500/5',
  RUB: 'border-orange-500/50 bg-orange-500/5',
}

export default function WalletsSummary({ transactions }: WalletsSummaryProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeWallet = (searchParams.get('wallet') || '') as CurrencyCode | ''

  const wallets = computeWalletBalances(transactions)

  const selectWallet = (currency: CurrencyCode | '') => {
    const params = new URLSearchParams(searchParams)
    if (currency) {
      params.set('wallet', currency)
    } else {
      params.delete('wallet')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Мои кошельки
        </h2>
        {activeWallet && (
          <button
            type="button"
            onClick={() => selectWallet('')}
            className="text-sm text-primary hover:underline"
          >
            Показать все кошельки
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {wallets.map((wallet) => {
          const meta = CURRENCIES[wallet.currency]
          const isActive = activeWallet === wallet.currency

          return (
            <Card
              key={wallet.currency}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                WALLET_COLORS[wallet.currency],
                isActive && 'ring-2 ring-primary shadow-md'
              )}
              onClick={() => selectWallet(isActive ? '' : wallet.currency)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{meta.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {wallet.currency}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    'text-2xl font-bold tabular-nums',
                    wallet.balance >= 0 ? 'text-foreground' : 'text-rose-600'
                  )}
                >
                  {wallet.balance >= 0 ? '' : '−'}
                  {formatMoney(Math.abs(wallet.balance), wallet.currency)}
                </p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p className="text-emerald-600">
                    +{formatMoney(wallet.income, wallet.currency)} доход
                  </p>
                  <p className="text-rose-600">
                    −{formatMoney(wallet.expenses, wallet.currency)} расход
                  </p>
                  <p>{wallet.transactionCount} операций</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {activeWallet && CURRENCY_CODES.includes(activeWallet) && (
        <p className="text-sm text-muted-foreground mt-3">
          Фильтр: кошелёк {CURRENCIES[activeWallet].label}. Нажмите на кошелёк ещё раз, чтобы сбросить.
        </p>
      )}
    </div>
  )
}
