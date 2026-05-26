'use client'

import { Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import CheckoutButton from '@/components/subscription/checkout-button'
import { PRO_FEATURE_LIST } from '@/lib/subscription'
import { PRO_SUBSCRIPTION_PRICE_USD } from '@/lib/stripe'

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  description?: string
}

export default function UpgradeDialog({
  open,
  onOpenChange,
  description,
}: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Подписка Pro
          </DialogTitle>
          <DialogDescription>
            {description ??
              `Разблокируйте расширенные функции за $${PRO_SUBSCRIPTION_PRICE_USD}/мес. Оплата через Stripe.`}
          </DialogDescription>
        </DialogHeader>

        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          {PRO_FEATURE_LIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          Администраторы пользуются всеми функциями бесплатно.
        </p>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <CheckoutButton label={`Оплатить $${PRO_SUBSCRIPTION_PRICE_USD}/мес`} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
