import { Transaction } from '@/lib/types'
import { formatMoney, convertToBynWithLookup } from '@/lib/currency'
import type { ExchangeRates, NbrbRate } from '@/lib/currency'
import { Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TransactionListProps {
  transactions: Transaction[]
  ratesLookup: Record<string, NbrbRate>
  todayRates: ExchangeRates
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

export default function TransactionList({
  transactions,
  ratesLookup,
  todayRates,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Транзакций пока нет</p>
      </div>
    )
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Валюта</TableHead>
            <TableHead className="text-right">Сумма</TableHead>
            <TableHead className="text-right">В BYN</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const currency = transaction.currency ?? 'BYN'
            const amountByn = convertToBynWithLookup(
              transaction.amount,
              currency,
              transaction.date,
              ratesLookup,
              todayRates
            )

            return (
              <TableRow
                key={transaction.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onEdit?.(transaction)}
              >
                <TableCell className="font-medium">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {transaction.type === 'income' ? 'Доход' : 'Расход'}
                  </span>
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.description || '—'}</TableCell>
                <TableCell className="font-mono text-sm">{currency}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '−'}
                  {formatMoney(transaction.amount, currency)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {currency !== 'BYN' ? (
                    <>≈ {formatMoney(amountByn, 'BYN')}</>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(transaction.id)
                    }}
                    aria-label="Удалить транзакцию"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
