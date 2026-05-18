'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
          <div className="space-y-2">
            <Label>Тип *</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="accent-primary"
                />
                <span className="text-emerald-600 font-medium">Доход</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="accent-primary"
                />
                <span className="text-rose-600 font-medium">Расход</span>
              </label>
            </div>
            {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-destructive text-sm">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Категория *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-destructive text-sm">{errors.category}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              maxLength={280}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              placeholder="Добавьте описание..."
            />
            <p className="text-muted-foreground text-xs">
              {formData.description?.length || 0}/280 символов
            </p>
            {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Дата *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            {errors.date && <p className="text-destructive text-sm">{errors.date}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="submit">
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
