-- Мультивалютный учёт: BYN, USD, EUR, RUB
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'BYN'
  CHECK (currency IN ('BYN', 'USD', 'EUR', 'RUB'));

CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);
