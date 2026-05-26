-- Аналитика для админ-панели: срок подписки и учёт входов
-- Выполните после database-migration-auth.sql и database-migration-subscription.sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS user_logins (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_logins_user_id ON user_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logins_logged_in_at ON user_logins(logged_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_logins_user_month ON user_logins(user_id, logged_in_at DESC);

ALTER TABLE user_logins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read user logins" ON user_logins;
DROP POLICY IF EXISTS "Users insert own login" ON user_logins;

CREATE POLICY "Admins read user logins" ON user_logins
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users insert own login" ON user_logins
  FOR INSERT WITH CHECK (user_id = auth.uid());
