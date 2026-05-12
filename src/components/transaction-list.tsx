import { Transaction } from '@/lib/types'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Транзакций пока нет</p>
        <button className="text-blue-600 hover:text-blue-800 underline">
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Тип
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Категория
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Описание
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Сумма
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr 
              key={transaction.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onEdit?.(transaction)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {transaction.type === 'income' ? 'Доход' : 'Расход'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.category}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {transaction.description || '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatAmount(transaction.amount, transaction.type)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  className="text-red-600 hover:text-red-900"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent row click
                    onDelete?.(transaction.id)
                  }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
