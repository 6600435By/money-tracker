'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBillingPortalSession } from '@/app/actions/stripe'
import { toast } from 'sonner'

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)
    const result = await createBillingPortalSession()
    if ('error' in result) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    window.location.href = result.url
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleManage}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        'Управление подпиской'
      )}
    </Button>
  )
}
