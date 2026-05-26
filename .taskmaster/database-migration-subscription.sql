-- Подписки Pro: план, Stripe, платные функции ($10/мес)
-- Выполните в Supabase SQL Editor после database-migration-auth.sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'pro', 'family'));

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- Срок действия подписки (для админ-панели) — database-migration-admin-analytics.sql:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- Пример: выдать Pro вручную (без Stripe)
-- UPDATE profiles SET plan = 'pro', subscription_status = 'active', subscription_period_end = NOW() + INTERVAL '30 days' WHERE email = 'user@example.com';
