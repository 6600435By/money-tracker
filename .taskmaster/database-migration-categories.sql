-- Пользовательские категории доходов и расходов
-- Выполните после database-migration-auth.sql

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 1 AND char_length(name) <= 50),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, type, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories select own" ON categories;
DROP POLICY IF EXISTS "Categories insert own" ON categories;
DROP POLICY IF EXISTS "Categories delete own" ON categories;

CREATE POLICY "Categories select own" ON categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Categories insert own" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Categories delete own" ON categories
  FOR DELETE USING (user_id = auth.uid());
