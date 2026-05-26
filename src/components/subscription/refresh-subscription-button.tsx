'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { refreshSubscriptionStatus } from '@/app/actions/stripe'
import { toast } from 'sonner'

export default function RefreshSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    const result = await refreshSubscriptionStatus()
    setLoading(false)

    if ('error' in result) {
      toast.error(result.error, { duration: 8000 })
      return
    }

    if (result.hasPro) {
      toast.success('Подписка Pro активна')
      window.location.reload()
    } else {
      toast.message('Активная подписка не найдена. Если вы только что оплатили — подождите минуту.')
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={handleRefresh}
      title="Обновить статус подписки"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      <span className="sr-only">Обновить Pro</span>
    </Button>
  )
}
