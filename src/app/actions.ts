'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CreateTransactionData, Transaction } from '@/lib/types'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(1),
  category: z.string().min(1),
  description: z
    .string()
    .max(280)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  date: z.string().min(1),
})

type ActionResult = { success: true } | { error: string }

function mapDbError(message: string): string {
  if (message.includes("user_id") && message.includes('schema cache')) {
    return 'Выполните SQL-миграцию в Supabase: .taskmaster/database-migration-auth.sql'
  }
  if (message.includes('row-level security')) {
    return 'Нет доступа к данным. Проверьте RLS-политики в Supabase.'
  }
  return 'Не удалось сохранить транзакцию'
}

export async function getTransactions(filters?: { type?: string; category?: string }): Promise<Transaction[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Server error fetching transactions:', error)
    return []
  }
}

export async function addTransaction(
  data: CreateTransactionData
): Promise<ActionResult> {
  try {
    const validatedData = transactionSchema.parse(data)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const row = { ...validatedData, ...(user ? { user_id: user.id } : {}) }

    let { error } = await supabase.from('transactions').insert([row])

    // Схема без миграции auth: колонки user_id ещё нет
    if (error?.message?.includes('user_id')) {
      const { type, amount, category, description, date } = validatedData
      ;({ error } = await supabase
        .from('transactions')
        .insert([{ type, amount, category, description, date }]))
    }

    if (error) {
      console.error('Error adding transaction:', error)
      return { error: mapDbError(error.message) }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Server error adding transaction:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? 'Неверные данные' }
    }
    return { error: 'Не удалось добавить транзакцию' }
  }
}

export async function updateTransaction(
  id: string,
  data: Partial<CreateTransactionData>
): Promise<ActionResult> {
  try {
    const validatedData = transactionSchema.partial().parse(data)
    const supabase = await createClient()
    const { error } = await supabase
      .from('transactions')
      .update(validatedData)
      .eq('id', id)

    if (error) {
      console.error('Error updating transaction:', error)
      return { error: mapDbError(error.message) }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Server error updating transaction:', error)
    return { error: 'Не удалось обновить транзакцию' }
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (error) {
      console.error('Error deleting transaction:', error)
      return { error: mapDbError(error.message) }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Server error deleting transaction:', error)
    return { error: 'Не удалось удалить транзакцию' }
  }
}
