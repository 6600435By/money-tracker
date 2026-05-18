'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import BalanceSummary from '@/components/balance-summary'
import TransactionList from '@/components/transaction-list'
import TransactionForm from '@/components/transaction-form'
import { Button } from '@/components/ui/button'
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from './actions'
import { Transaction, CreateTransactionData, CATEGORIES } from '@/lib/types'

export default function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const typeFilter = searchParams.get('type') || ''
  const categoryFilter = searchParams.get('category') || ''

  // Fetch transactions on component mount and when filters change
  useEffect(() => {
    loadTransactions()
  }, [typeFilter, categoryFilter])

  const loadTransactions = async () => {
    try {
      const filters: { type?: string; category?: string } = {}
      if (typeFilter) filters.type = typeFilter
      if (categoryFilter) filters.category = categoryFilter

      const data = await getTransactions(filters)
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
      setTransactions([])
    }
  }

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.replace(pathname)
  }

  const handleAddTransaction = async (data: CreateTransactionData) => {
    setLoading(true)
    setActionError(null)
    const result = await addTransaction(data)
    if ('error' in result) {
      setActionError(result.error)
      setLoading(false)
      return
    }
    setShowForm(false)
    setEditingTransaction(null)
    await loadTransactions()
    setLoading(false)
  }

  const handleEditTransaction = async (data: CreateTransactionData) => {
    if (!editingTransaction) return
    setLoading(true)
    setActionError(null)
    const result = await updateTransaction(editingTransaction.id, data)
    if ('error' in result) {
      setActionError(result.error)
      setLoading(false)
      return
    }
    setEditingTransaction(null)
    setShowForm(false)
    await loadTransactions()
    setLoading(false)
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Точно удалить эту транзакцию?')) return
    setLoading(true)
    setActionError(null)
    const result = await deleteTransaction(id)
    if ('error' in result) {
      setActionError(result.error)
    } else {
      await loadTransactions()
    }
    setLoading(false)
  }

  const handleRowClick = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {actionError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {actionError}
          </div>
        )}

        <div className="flex justify-end mb-8">
          <Button
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            + Добавить
          </Button>
        </div>

        {showForm && (
          <div className="mb-8">
            <TransactionForm 
              onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
              onCancel={() => {
                setShowForm(false)
                setEditingTransaction(null)
              }}
              initialData={editingTransaction || undefined}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            <Button
              variant={typeFilter === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('type', '')}
            >
              Все
            </Button>
            <Button
              variant={typeFilter === 'income' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('type', 'income')}
            >
              Доходы
            </Button>
            <Button
              variant={typeFilter === 'expense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('type', 'expense')}
            >
              Расходы
            </Button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="">Все категории</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {(typeFilter || categoryFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>

        <BalanceSummary transactions={transactions} />
        <TransactionList 
          transactions={transactions} 
          onEdit={handleRowClick}
          onDelete={handleDeleteTransaction}
        />
        
        {transactions.length === 0 && (
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Нет транзакций
            </h3>
            <p className="text-yellow-700 mb-4">
              Добавьте первую транзакцию или выполните SQL-миграцию в Supabase, если таблица ещё не создана.
            </p>
            <p className="text-sm text-yellow-600">
              Миграция: <code>.taskmaster/database-migration-auth.sql</code>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
