'use server'

import { getTransactions } from '@/app/actions'
import { getOrCreateProfile } from '@/lib/profile'
import {
  buildExportFilename,
  transactionsToCsv,
  withUtf8Bom,
} from '@/lib/csv'
import { getCsvExportAccess } from '@/lib/subscription'

export type ExportTransactionsFilters = {
  type?: string
  category?: string
  currency?: string
}

export type ExportCsvResult =
  | {
      success: true
      csv: string
      filename: string
      rowCount: number
    }
  | {
      success: false
      error: string
      code: 'SUBSCRIPTION_REQUIRED' | 'UNAUTHORIZED' | 'EMPTY'
    }

export async function exportTransactionsCsv(
  filters?: ExportTransactionsFilters
): Promise<ExportCsvResult> {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return {
      success: false,
      error: 'Войдите в аккаунт, чтобы экспортировать данные.',
      code: 'UNAUTHORIZED',
    }
  }

  const access = getCsvExportAccess(profile)
  if (!access.allowed) {
    return {
      success: false,
      error: access.message,
      code: access.code,
    }
  }

  const transactions = await getTransactions({
    type: filters?.type || undefined,
    category: filters?.category || undefined,
    currency: filters?.currency || undefined,
  })

  if (transactions.length === 0) {
    return {
      success: false,
      error: 'Нет транзакций для экспорта. Снимите фильтры или добавьте записи.',
      code: 'EMPTY',
    }
  }

  const csv = withUtf8Bom(transactionsToCsv(transactions))

  return {
    success: true,
    csv,
    filename: buildExportFilename(),
    rowCount: transactions.length,
  }
}
