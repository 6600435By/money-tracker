export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
  created_at: string
  user_id?: string
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

export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'blocked'

export interface Profile {
  id: number
  user_id: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
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
