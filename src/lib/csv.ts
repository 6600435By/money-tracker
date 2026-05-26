import type { Transaction } from '@/lib/types'

const TYPE_LABELS: Record<Transaction['type'], string> = {
  income: 'Доход',
  expense: 'Расход',
}

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function csvRow(cells: (string | number)[]): string {
  return cells.map((c) => escapeCsvField(c)).join(',')
}

const CSV_HEADERS = [
  'id',
  'date',
  'type',
  'type_label',
  'amount',
  'currency',
  'category',
  'description',
  'created_at',
] as const

export function transactionsToCsv(transactions: Transaction[]): string {
  const lines = [
    csvRow([...CSV_HEADERS]),
    ...transactions.map((t) =>
      csvRow([
        t.id,
        t.date,
        t.type,
        TYPE_LABELS[t.type],
        t.amount,
        t.currency ?? 'BYN',
        t.category,
        t.description ?? '',
        t.created_at,
      ])
    ),
  ]
  return lines.join('\r\n')
}

/** UTF-8 BOM для корректного открытия в Excel */
export function withUtf8Bom(csv: string): string {
  return `\uFEFF${csv}`
}

export function buildExportFilename(prefix = 'money-tracker-transactions'): string {
  const date = new Date().toISOString().slice(0, 10)
  return `${prefix}-${date}.csv`
}
