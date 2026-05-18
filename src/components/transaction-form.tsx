'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES, CreateTransactionData } from '@/lib/types'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(1, 'Сумма должна быть больше 0'),
  category: z.string().min(1, 'Выберите категорию'),
  description: z.string().max(280, 'Описание не должно превышать 280 символов').optional(),
  date: z.string().min(1, 'Выберите дату')
})

interface TransactionFormProps {
  initialData?: Partial<CreateTransactionData>
  onSubmit: (data: CreateTransactionData) => void
  onCancel?: () => void
}

export default function TransactionForm({ initialData, onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState<CreateTransactionData>({
    type: initialData?.type || 'expense',
    amount: initialData?.amount ?? 0,
    category: initialData?.category || CATEGORIES[0],
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
  })
  const [amountInput, setAmountInput] = useState(
    initialData?.amount ? String(initialData.amount) : ''
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(amountInput.replace(',', '.'))
    const payload = { ...formData, amount }

    try {
      transactionSchema.parse(payload)
      setErrors({})
      setFormData(payload)
      onSubmit(payload)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          newErrors[err.path[0] as string] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  const handleChange = (field: keyof CreateTransactionData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? Number(value) : value
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Редактировать транзакцию' : 'Добавить транзакцию'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="mr-2"
                />
                <span className="text-green-600">Доход</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="mr-2"
                />
                <span className="text-red-600">Расход</span>
              </label>
            </div>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сумма *
            </label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (необязательно)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              maxLength={280}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Добавьте описание..."
            />
            <p className="text-gray-500 text-sm mt-1">
              {formData.description?.length || 0}/280 символов
            </p>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата *
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {initialData ? 'Сохранить' : 'Добавить'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Отмена
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
