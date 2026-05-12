# Money Tracker

Простой веб-сайт для отслеживания доходов и расходов, построенный на Next.js 16 и Supabase.

## Технический стек

- **Next.js 16** с App Router и TypeScript
- **Tailwind CSS 4** для стилей
- **shadcn/ui** для готовых компонентов
- **Supabase** — база данных PostgreSQL + Row Level Security
- **Server Actions** — основной способ писать бэкенд-логику

## Функциональность

- ✅ Просмотр транзакций в виде таблицы
- ✅ Баланс и сводка по доходам/расходам за месяц
- ✅ Добавление транзакций с валидацией
- ✅ Server Actions для CRUD операций
- 🔄 Редактирование транзакций (в процессе)
- 🔄 Удаление транзакций (в процессе)
- 🔄 Фильтрация по типу транзакций (опционально)

## Быстрый старт

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd money_tracker
npm install
```

### 2. Настройка Supabase

1. Создайте новый проект в [Supabase Dashboard](https://supabase.com/dashboard)
2. Скопируйте URL и anon ключ из Settings > API
3. Создайте файл `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Заполните переменные в `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Настройка базы данных

Выполните SQL скрипт из `.taskmaster/database-schema.sql` в Supabase SQL Editor:

```sql
-- Создание таблицы transactions
-- Включение RLS политик
-- Добавление тестовых данных
```

### 4. Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
src/
├── app/
│   ├── page.tsx              ← главная: список транзакций + баланс
│   ├── layout.tsx
│   ├── globals.css
│   ├── actions.ts            ← все Server Actions
│   └── middleware.ts         ← обновление сессии Supabase
├── components/
│   ├── ui/                   ← shadcn/ui компоненты
│   ├── balance-summary.tsx   ← три карточки с цифрами
│   ├── transaction-form.tsx  ← форма добавления/редактирования
│   └── transaction-list.tsx  ← таблица транзакций
├── lib/
│   ├── supabase/
│   │   ├── client.ts         ← createBrowserClient
│   │   └── server.ts         ← createServerClient
│   ├── types.ts              ← TypeScript-типы для Transaction
│   └── utils.ts              ← утилиты для shadcn/ui
└── middleware.ts             ← middleware для Supabase
```

## Доступные скрипты

- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка для продакшена
- `npm run start` — запуск продакшн сборки
- `npm run lint` — проверка кода

## Следующие шаги

1. **Реализовать редактирование** — клик по строке таблицы открывает форму с данными
2. **Реализовать удаление** — кнопка "корзина" с подтверждением
3. **Добавить фильтрацию** — кнопки "Все", "Доходы", "Расходы"
4. **Создать API Routes** — альтернативный доступ к данным
5. **Тестирование** — проверка всех CRUD операций
6. **Деплой на Vercel** — публикация приложения

## Лицензия

ISC
