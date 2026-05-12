'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CreateTransactionData, Transaction } from '@/lib/types'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(1),
  category: z.string().min(1),
  description: z.string().max(280).optional(),
  date: z.string().min(1)
})

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

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

export async function addTransaction(data: CreateTransactionData) {
  try {
    // Validate data
    const validatedData = transactionSchema.parse(data)
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('transactions')
      .insert([validatedData])

    if (error) {
      console.error('Error adding transaction:', error)
      throw new Error('Failed to add transaction')
    }

    // Revalidate the home page to show the new transaction
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Server error adding transaction:', error)
    throw new Error('Failed to add transaction')
  }
}

export async function updateTransaction(id: string, data: Partial<CreateTransactionData>) {
  try {
    // Validate data
    const validatedData = transactionSchema.partial().parse(data)
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('transactions')
      .update(validatedData)
      .eq('id', id)

    if (error) {
      console.error('Error updating transaction:', error)
      throw new Error('Failed to update transaction')
    }

    // Revalidate the home page to show the updated transaction
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Server error updating transaction:', error)
    throw new Error('Failed to update transaction')
  }
}

export async function deleteTransaction(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting transaction:', error)
      throw new Error('Failed to delete transaction')
    }

    // Revalidate the home page to show the updated transaction list
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Server error deleting transaction:', error)
    throw new Error('Failed to delete transaction')
  }
}
