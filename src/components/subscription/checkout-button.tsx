'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createProCheckoutSession } from '@/app/actions/stripe'
import { toast } from 'sonner'

interface CheckoutButtonProps {
  label?: string
  className?: string
  size?: 'default' | 'sm' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
}

export default function CheckoutButton({
  label = 'Оформить Pro — $10/мес',
  className,
  size = 'default',
  variant = 'default',
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    const result = await createProCheckoutSession()
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
      variant={variant}
      className={className}
      size={size}
      disabled={loading}
      onClick={handleCheckout}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Переход к оплате…
        </>
      ) : (
        label
      )}
    </Button>
  )
}
