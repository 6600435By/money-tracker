'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus } from 'lucide-react'
import BalanceSummary from '@/components/balance-summary'
import SpendingChart from '@/components/spending-chart'
import TransactionList from '@/components/transaction-list'
import TransactionForm from '@/components/transaction-form'
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    setLoading(true)
    setActionError(null)
    const result = await deleteTransaction(deletingId)
    if ('error' in result) {
      setActionError(result.error)
    } else {
      await loadTransactions()
    }
    setLoading(false)
    setDeleteDialogOpen(false)
    setDeletingId(null)
  }

  const handleRowClick = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {actionError && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>
              {actionError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end mb-8">
          <Button
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить
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

          <Select value={categoryFilter} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все категории</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(typeFilter || categoryFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-primary hover:underline"
            >
              Сбросить фильтры
            </Button>
          )}
        </div>

        <BalanceSummary transactions={transactions} />
        <SpendingChart transactions={transactions} />
        <TransactionList 
          transactions={transactions} 
          onEdit={handleRowClick}
          onDelete={handleDeleteTransaction}
        />
        
        {transactions.length === 0 && (
          <Alert className="mt-8">
            <AlertDescription>
              <h3 className="text-lg font-semibold mb-2">Нет транзакций</h3>
              <p className="mb-4">
                Добавьте первую транзакцию или выполните SQL-миграцию в Supabase, если таблица ещё не создана.
              </p>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                .taskmaster/database-migration-auth.sql
              </p>
            </AlertDescription>
          </Alert>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить транзакцию?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  )
}
