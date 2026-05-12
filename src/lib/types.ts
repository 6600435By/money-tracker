export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
  created_at: string
}

export interface CreateTransactionData {
  amount: number
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: string
}

export const CATEGORIES = [
  'Зарплата',
  'Фриланс',
  'Еда',
  'Транспорт',
  'Развлечения',
  'Прочее'
] as const

export type Category = typeof CATEGORIES[number]
