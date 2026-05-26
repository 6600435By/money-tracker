'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  CategoriesByType,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  mergeCategoryNames,
  normalizeCategoryName,
  type CategoryType,
  type UserCategory,
} from '@/lib/categories'
import { createClient } from '@/lib/supabase/server'

const addCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Введите название категории')
    .max(50, 'Не более 50 символов')
    .transform(normalizeCategoryName),
  type: z.enum(['income', 'expense']),
})

type ActionResult = { success: true } | { error: string }

function mapCategoriesDbError(message: string): string {
  if (message.includes('categories') || message.includes('schema cache')) {
    return 'Выполните SQL-миграцию: .taskmaster/database-migration-categories.sql'
  }
  if (message.includes('duplicate key') || message.includes('unique')) {
    return 'Такая категория уже существует'
  }
  if (message.includes('row-level security')) {
    return 'Нет доступа к категориям. Проверьте RLS в Supabase.'
  }
  return 'Не удалось сохранить категорию'
}

function emptyCategories(): CategoriesByType {
  return {
    income: [...DEFAULT_INCOME_CATEGORIES],
    expense: [...DEFAULT_EXPENSE_CATEGORIES],
    custom: [],
  }
}

export async function getCategories(): Promise<CategoriesByType> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return emptyCategories()
    }

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, type')
      .eq('user_id', user.id)
      .order('name')

    if (error) {
      if (
        error.message.includes('categories') ||
        error.code === '42P01' ||
        error.message.includes('schema cache')
      ) {
        return emptyCategories()
      }
      console.error('getCategories error:', error)
      return emptyCategories()
    }

    const custom = (data ?? []) as UserCategory[]

    return {
      income: mergeCategoryNames(DEFAULT_INCOME_CATEGORIES, custom, 'income'),
      expense: mergeCategoryNames(DEFAULT_EXPENSE_CATEGORIES, custom, 'expense'),
      custom,
    }
  } catch (error) {
    console.error('getCategories error:', error)
    return emptyCategories()
  }
}

export async function getCategoryNames(type?: CategoryType): Promise<string[]> {
  const all = await getCategories()
  if (type === 'income') return all.income
  if (type === 'expense') return all.expense
  return [...new Set([...all.income, ...all.expense])].sort((a, b) =>
    a.localeCompare(b, 'ru')
  )
}

export async function addCategory(
  name: string,
  type: CategoryType
): Promise<ActionResult & { name?: string }> {
  try {
    const parsed = addCategorySchema.safeParse({ name, type })
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Неверные данные' }
    }

    const normalized = parsed.data.name
    const defaults =
      type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES

    if ((defaults as readonly string[]).includes(normalized)) {
      return { error: 'Эта категория уже есть в списке по умолчанию' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Войдите в аккаунт' }
    }

    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: normalized,
      type,
    })

    if (error) {
      console.error('addCategory error:', error)
      return { error: mapCategoriesDbError(error.message) }
    }

    revalidatePath('/')
    return { success: true, name: normalized }
  } catch (error) {
    console.error('addCategory error:', error)
    return { error: 'Не удалось добавить категорию' }
  }
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      console.error('deleteCategory error:', error)
      return { error: mapCategoriesDbError(error.message) }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('deleteCategory error:', error)
    return { error: 'Не удалось удалить категорию' }
  }
}
