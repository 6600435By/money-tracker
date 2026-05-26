'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { addCategory, deleteCategory, getCategories } from '@/app/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  defaultCategoriesForType,
  type CategoriesByType,
  type CategoryType,
} from '@/lib/categories'

interface CategorySelectProps {
  type: CategoryType
  value: string
  onChange: (value: string) => void
  error?: string
  id?: string
}

export default function CategorySelect({
  type,
  value,
  onChange,
  error,
  id = 'category',
}: CategorySelectProps) {
  const [categories, setCategories] = useState<CategoriesByType | null>(null)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    const data = await getCategories()
    setCategories(data)
    return data
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const names =
    categories?.[type] ?? [...defaultCategoriesForType(type)]

  const namesKey = names.join('\0')

  useEffect(() => {
    if (!names.length) return
    if (!value || !names.includes(value)) {
      onChange(names[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when type/list changes only
  }, [type, namesKey])

  const customForType =
    categories?.custom.filter((c) => c.type === type) ?? []

  const handleAdd = async () => {
    if (!newName.trim()) {
      setAddError('Введите название')
      return
    }
    setAdding(true)
    setAddError(null)
    const result = await addCategory(newName, type)
    setAdding(false)

    if ('error' in result) {
      setAddError(result.error)
      return
    }

    setNewName('')
    const data = await load()
    if (result.name) {
      onChange(result.name)
    } else if (data) {
      const list = data[type]
      if (list.length) onChange(list[list.length - 1])
    }
  }

  const handleDelete = async (categoryId: number, name: string) => {
    setDeletingId(categoryId)
    const result = await deleteCategory(categoryId)
    setDeletingId(null)

    if ('error' in result) {
      setAddError(result.error)
      return
    }

    const data = await load()
    if (value === name && data) {
      onChange(data[type][0] ?? defaultCategoriesForType(type)[0])
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={id}>Категория *</Label>
        <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {names.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      {customForType.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {customForType.map((cat) => (
            <li
              key={cat.id}
              className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs"
            >
              <span>{cat.name}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                title="Удалить категорию"
                disabled={deletingId === cat.id}
                onClick={() => void handleDelete(cat.id, cat.name)}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value)
            setAddError(null)
          }}
          placeholder="Новая категория"
          maxLength={50}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleAdd()
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={adding}
          onClick={() => void handleAdd()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить
        </Button>
      </div>
      {addError && <p className="text-destructive text-sm">{addError}</p>}
      <p className="text-xs text-muted-foreground">
        Свои категории сохраняются отдельно для доходов и расходов.
      </p>
    </div>
  )
}
