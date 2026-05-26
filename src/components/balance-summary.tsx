import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/lib/types'
import {
  type ExchangeRates,
  type NbrbRate,
  convertToBynWithLookup,
  formatMoney,
} from '@/lib/currency'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface BalanceSummaryProps {
  transactions: Transaction[]
  ratesLookup: Record<string, NbrbRate>
  todayRates: ExchangeRates
}

export default function BalanceSummary({
  transactions,
  ratesLookup,
  todayRates,
}: BalanceSummaryProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    )
  })

  const toByn = (t: Transaction) =>
    convertToBynWithLookup(
      t.amount,
      t.currency ?? 'BYN',
      t.date,
      ratesLookup,
      todayRates
    )

  const income = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + toByn(t), 0)

  const expenses = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + toByn(t), 0)

  const balance = income - expenses

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Доходы за месяц</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 text-balance-display">
            {formatMoney(income, 'BYN')}
          </div>
          <p className="text-xs text-muted-foreground">в пересчёте на BYN (НБ РБ)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Расходы за месяц</CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600 text-balance-display">
            {formatMoney(expenses, 'BYN')}
          </div>
          <p className="text-xs text-muted-foreground">в пересчёте на BYN (НБ РБ)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Баланс</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-rose-600'} text-balance-display`}
          >
            {balance >= 0 ? '+' : '−'}
            {formatMoney(Math.abs(balance), 'BYN')}
          </div>
          <p className="text-xs text-muted-foreground">доходы − расходы (BYN)</p>
        </CardContent>
      </Card>
    </div>
  )
}
