import { Banknote, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CheckoutButton from '@/components/subscription/checkout-button'
import { PRO_FEATURE_LIST } from '@/lib/subscription'
import { PRO_SUBSCRIPTION_PRICE_USD } from '@/lib/stripe'

interface ProPaywallProps {
  title?: string
}

export default function ProPaywall({
  title = 'Курсы валют и конвертер',
}: ProPaywallProps) {
  return (
    <Card className="mb-8 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
          <Banknote className="h-8 w-8 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Доступно по подписке{' '}
              <span className="font-semibold text-primary">Pro</span> —{' '}
              <span className="font-semibold">${PRO_SUBSCRIPTION_PRICE_USD}/мес</span>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
              {PRO_FEATURE_LIST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <CheckoutButton />
      </CardContent>
    </Card>
  )
}
