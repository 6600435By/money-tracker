# Настройка Stripe Pro ($10/мес)

## 1. API keys

См. [Stripe API keys](https://docs.stripe.com/keys):

1. [Dashboard → API keys](https://dashboard.stripe.com/test/apikeys) (sandbox для разработки).
2. Скопируйте **Secret key** (`sk_test_…`) в `STRIPE_SECRET_KEY`.
3. Не коммитьте ключи в git — только `.env.local`.

## 2. Продукт и цена

1. [Products](https://dashboard.stripe.com/test/products) → **Add product**.
2. Название: `Money Tracker Pro`.
3. Pricing: **Recurring**, **$10.00 USD**, **Monthly**.
4. Скопируйте **Price ID** (`price_…`) → `STRIPE_PRICE_ID`.

## 3. Customer Portal (управление подпиской)

1. [Settings → Billing → Customer portal](https://dashboard.stripe.com/test/settings/billing/portal).
2. Включите отмену подписки и обновление способа оплаты.

## 4. Webhook

1. [Developers → Webhooks](https://dashboard.stripe.com/test/webhooks) → **Add endpoint**.
2. URL: `https://ВАШ_ДОМЕН/api/webhooks/stripe` (локально: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`).
3. События:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Signing secret (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.

### Локальная разработка

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 5. Supabase

Выполните `.taskmaster/database-migration-subscription.sql`.

## 6. Платные функции

При настроенных `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`:

| Функция | Free | Pro / Admin |
|---------|------|-------------|
| Курсы валют НБ РБ | ❌ | ✅ |
| Конвертер | ❌ | ✅ |
| Экспорт CSV | ❌ | ✅ |

Администраторы (`role = admin`) — всегда бесплатно.

Без Stripe-переменных paywall **отключён** (удобно для локальной разработки).
