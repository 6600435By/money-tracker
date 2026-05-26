export type CategoryType = 'income' | 'expense'

export const DEFAULT_INCOME_CATEGORIES = [
  'Зарплата',
  'Фриланс',
  'Подарки',
  'Прочее',
] as const

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Еда',
  'Транспорт',
  'Жильё',
  'Развлечения',
  'Здоровье',
  'Прочее',
] as const

/** Все встроенные категории (для фильтра «все типы») */
export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_EXPENSE_CATEGORIES,
] as const

export interface UserCategory {
  id: number
  name: string
  type: CategoryType
}

export interface CategoriesByType {
  income: string[]
  expense: string[]
  custom: UserCategory[]
}

export function defaultCategoriesForType(type: CategoryType): readonly string[] {
  return type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES
}

export function mergeCategoryNames(
  defaults: readonly string[],
  custom: UserCategory[],
  type: CategoryType
): string[] {
  const names = new Set<string>(defaults)
  for (const item of custom) {
    if (item.type === type) {
      names.add(item.name)
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'ru'))
}

export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function isDefaultCategory(name: string, type: CategoryType): boolean {
  return (defaultCategoriesForType(type) as readonly string[]).includes(name)
}
