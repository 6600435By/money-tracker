'use client'

import { useState, useEffect } from 'react'
import BalanceSummary from '@/components/balance-summary'
import TransactionList from '@/components/transaction-list'
import TransactionForm from '@/components/transaction-form'
import { Button } from '@/components/ui/button'
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from './actions'
import { Transaction, CreateTransactionData } from '@/lib/types'

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch transactions on component mount
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const data = await getTransactions()
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
      setTransactions([])
    }
  }

  const handleAddTransaction = async (data: CreateTransactionData) => {
    setLoading(true)
    try {
      await addTransaction(data)
      setShowForm(false)
      setEditingTransaction(null)
      await loadTransactions() // Refresh transactions list
    } catch (error) {
      console.error('Failed to add transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTransaction = async (data: CreateTransactionData) => {
    setLoading(true)
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data)
        setEditingTransaction(null)
        setShowForm(false)
        await loadTransactions() // Refresh transactions list
      }
    } catch (error) {
      console.error('Failed to update transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Точно удалить эту транзакцию?')) {
      setLoading(true)
      try {
        await deleteTransaction(id)
        await loadTransactions() // Refresh transactions list
      } catch (error) {
        console.error('Failed to delete transaction:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRowClick = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Money Tracker
          </h1>
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

        <BalanceSummary transactions={transactions} />
        <TransactionList 
          transactions={transactions} 
          onEdit={handleRowClick}
          onDelete={handleDeleteTransaction}
        />
        
        {transactions.length === 0 && (
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              База данных не настроена
            </h3>
            <p className="text-yellow-700 mb-4">
              Пожалуйста, выполните SQL скрипт в Supabase SQL Editor для настройки таблицы transactions.
            </p>
            <p className="text-sm text-yellow-600">
              SQL скрипт находится в файле: <code>.taskmaster/database-schema.sql</code>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
