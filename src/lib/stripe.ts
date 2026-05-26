import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export const PRO_SUBSCRIPTION_PRICE_USD = 10
const PRO_PRODUCT_METADATA_KEY = 'money_tracker_pro'

function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined
  let v = value.trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim()
  }
  return v || undefined
}

/** Secret key из .env (без пробелов и кавычек) */
export function getStripeSecretKey(): string | undefined {
  const key = normalizeEnvValue(process.env.STRIPE_SECRET_KEY)
  if (!key) return undefined

  if (key.startsWith('rk_test_') || key.startsWith('rk_live_')) {
    throw new Error(
      'В STRIPE_SECRET_KEY указан Restricted key (rk_…). Нужен Secret key (sk_test_…) из раздела Standard keys.'
    )
  }

  if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
    throw new Error(
      'STRIPE_SECRET_KEY должен начинаться с sk_test_ (песочница) или sk_live_ (продакшен).'
    )
  }

  return key
}

export function hasStripeSecretKey(): boolean {
  try {
    return Boolean(getStripeSecretKey())
  } catch {
    return false
  }
}

export function isStripeCheckoutReady(): boolean {
  return hasStripeSecretKey()
}

export function isStripeWebhookConfigured(): boolean {
  const webhook = normalizeEnvValue(process.env.STRIPE_WEBHOOK_SECRET)
  return Boolean(getStripeSecretKey() && webhook)
}

/** @deprecated используйте isStripeCheckoutReady */
export function isStripeConfigured(): boolean {
  return isStripeWebhookConfigured()
}

export function getStripe(): Stripe {
  const secretKey = getStripeSecretKey()
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY не задан. Stripe Dashboard → Developers → API keys → Secret key.'
    )
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      typescript: true,
    })
  }

  return stripeClient
}

export function formatStripeAuthError(): string {
  return (
    'Неверный STRIPE_SECRET_KEY. В [Stripe Dashboard → API keys](https://dashboard.stripe.com/test/apikeys) ' +
    'нажмите «Create secret key» или «Reveal» у Secret key (sk_test_…), ' +
    'вставьте ключ в .env.local без кавычек и перезапустите: npm run dev'
  )
}

/** URL приложения для redirect после Stripe (учитывает порт dev-сервера) */
export async function getAppBaseUrl(): Promise<string> {
  const fromEnv = normalizeEnvValue(process.env.NEXT_PUBLIC_APP_URL)
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  try {
    const { headers } = await import('next/headers')
    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const proto = h.get('x-forwarded-proto') ?? 'http'
    if (host) {
      return `${proto}://${host}`.replace(/\/$/, '')
    }
  } catch {
    // вне request context
  }

  return 'http://localhost:3000'
}

export async function resolveProPriceId(stripe: Stripe): Promise<string> {
  const priceFromEnv = normalizeEnvValue(process.env.STRIPE_PRICE_ID)
  if (priceFromEnv) {
    return priceFromEnv
  }

  const products = await stripe.products.list({ limit: 100, active: true })
  let product =
    products.data.find((p) => p.metadata?.app === PRO_PRODUCT_METADATA_KEY) ??
    null

  if (!product) {
    product = await stripe.products.create({
      name: 'Money Tracker Pro',
      description: 'Курсы валют, конвертер и экспорт CSV',
      metadata: { app: PRO_PRODUCT_METADATA_KEY },
    })
  }

  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 20,
  })

  const existing = prices.data.find(
    (p) =>
      p.recurring?.interval === 'month' &&
      p.unit_amount === PRO_SUBSCRIPTION_PRICE_USD * 100 &&
      p.currency === 'usd'
  )
  if (existing) return existing.id

  const created = await stripe.prices.create({
    product: product.id,
    unit_amount: PRO_SUBSCRIPTION_PRICE_USD * 100,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { app: PRO_PRODUCT_METADATA_KEY },
  })

  return created.id
}
