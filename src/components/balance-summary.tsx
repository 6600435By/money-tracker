import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/lib/types'

interface BalanceSummaryProps {
  transactions: Transaction[]
}

export default function BalanceSummary({ transactions }: BalanceSummaryProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear
  })

  const income = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expenses

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Доходы за месяц</CardTitle>
          <div className="h-4 w-4 text-green-600">📈</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatAmount(income)}
          </div>
          <p className="text-xs text-muted-foreground">
            Текущий месяц
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Расходы за месяц</CardTitle>
          <div className="h-4 w-4 text-red-600">📉</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatAmount(expenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            Текущий месяц
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Баланс</CardTitle>
          <div className="h-4 w-4 text-blue-600">💰</div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : '-'}{formatAmount(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            Доходы − расходы
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
