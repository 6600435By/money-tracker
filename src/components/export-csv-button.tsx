'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UpgradeDialog from '@/components/subscription/upgrade-dialog'
import {
  exportTransactionsCsv,
  type ExportTransactionsFilters,
} from '@/app/actions/export'

interface ExportCsvButtonProps {
  filters?: ExportTransactionsFilters
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function ExportCsvButton({
  filters,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
}: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setErrorMessage(null)

    const result = await exportTransactionsCsv(filters)

    if (result.success) {
      downloadCsv(result.csv, result.filename)
      setLoading(false)
      return
    }

    if (result.code === 'SUBSCRIPTION_REQUIRED') {
      setUpgradeOpen(true)
      setLoading(false)
      return
    }

    setErrorMessage(result.error)
    setLoading(false)
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || loading}
        onClick={handleExport}
        aria-label="Экспорт транзакций в CSV"
      >
        <Download className="h-4 w-4 mr-2" />
        {loading ? 'Экспорт…' : 'Экспорт CSV'}
      </Button>

      {errorMessage && (
        <span className="text-sm text-destructive" role="alert">
          {errorMessage}
        </span>
      )}

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        description="Экспорт всех транзакций в CSV входит в подписку Pro ($10/мес)."
      />
    </>
  )
}
