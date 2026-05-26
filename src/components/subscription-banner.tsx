'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { syncProSubscriptionAfterPayment } from '@/app/actions/stripe'

export default function SubscriptionBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const handled = useRef<string | null>(null)

  useEffect(() => {
    const status = searchParams.get('subscription')
    if (!status) return

    const sessionId = searchParams.get('session_id') ?? undefined
    const key = `${status}:${sessionId ?? ''}`
    if (handled.current === key) return
    handled.current = key

    const run = async () => {
      if (status === 'success') {
        toast.loading('Активируем подписку Pro…', { id: 'pro-sync' })

        const result = await syncProSubscriptionAfterPayment(sessionId)

        toast.dismiss('pro-sync')

        if ('error' in result) {
          toast.error(result.error, { duration: 8000 })
        } else if (result.synced) {
          toast.success('Подписка Pro активирована!')
          router.refresh()
        } else {
          toast.error('Не удалось активировать Pro. Нажмите «Обновить Pro» в шапке.')
        }
      } else if (status === 'canceled') {
        toast.message('Оплата отменена.')
      }

      const params = new URLSearchParams(searchParams.toString())
      params.delete('subscription')
      params.delete('session_id')
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    }

    void run()
  }, [searchParams, router, pathname])

  return null
}
