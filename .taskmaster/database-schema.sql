-- Complete database reset - drop everything and start fresh
DROP TABLE IF EXISTS transactions CASCADE;

-- Create transactions table
CREATE TABLE transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for educational project (open access)
-- In production, these should check auth.uid() = user_id

-- Allow anyone to read transactions (educational project)
CREATE POLICY "Allow read access" ON transactions
  FOR SELECT USING (true);

-- Allow anyone to insert transactions (educational project)
CREATE POLICY "Allow insert access" ON transactions
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update transactions (educational project)
CREATE POLICY "Allow update access" ON transactions
  FOR UPDATE USING (true);

-- Allow anyone to delete transactions (educational project)
CREATE POLICY "Allow delete access" ON transactions
  FOR DELETE USING (true);

-- Insert sample data for testing
INSERT INTO transactions (amount, type, category, description, date) VALUES
(50000.00, 'income', 'Зарплата', 'Ежемесячная зарплата', '2026-05-01'),
(15000.00, 'income', 'Фриланс', 'Проект для клиента', '2026-05-05'),
(2500.50, 'expense', 'Еда', 'Продукты на неделю', '2026-05-02'),
(1200.00, 'expense', 'Транспорт', 'Проездной и такси', '2026-05-03'),
(3500.00, 'expense', 'Развлечения', 'Кино и рестораны', '2026-05-04');
