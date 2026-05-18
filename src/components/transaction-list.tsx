import { Transaction } from '@/lib/types'
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
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Транзакций пока нет</p>
        <button className="text-primary hover:underline">
          Добавить первую транзакцию
        </button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
    
    return formatted
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Дата</TableHead>
            <TableHead className="text-left">Тип</TableHead>
            <TableHead className="text-left">Категория</TableHead>
            <TableHead className="text-left">Описание</TableHead>
            <TableHead className="text-right">Сумма</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
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
              <TableCell>{transaction.description || '-'}</TableCell>
              <TableCell className={`text-right font-medium ${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatAmount(transaction.amount, transaction.type)}
              </TableCell>
              <TableCell className="text-right">
                <button 
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent row click
                    onDelete?.(transaction.id)
                  }}
                  aria-label="Удалить транзакцию"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
