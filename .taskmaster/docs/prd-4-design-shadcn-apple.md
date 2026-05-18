# PRD 4 — Редизайн UI: shadcn/ui + стиль Apple

**Версия:** 1.0  
**Дата:** 2026-05-18  
**Статус:** Черновик  
**Зависимости:** PRD (модуль 6), PRD-2 (auth), PRD-3 (роли и админ-панель)

---

## 1. Обзор

Данный PRD описывает полное обновление визуального языка приложения **Money Tracker**: переход на полноценную экосистему [shadcn/ui](https://ui.shadcn.com) через [CLI](https://ui.shadcn.com/docs/cli), замена всех эмодзи на иконки **Lucide React**, и выравнивание интерфейса по эстетике [apple.com](https://www.apple.com) — минимализм, воздух, нейтральная палитра, крупная типографика, сдержанные акценты.

Цель — единый, профессиональный и доступный UI без «декоративных» эмодзи и разрозненных Tailwind-классов (`gray-50`, `blue-600` и т.д.), которые сейчас дублируют и обходят design tokens shadcn.

---

## 2. Проблема

### 2.1 Текущее состояние UI

| Область | Проблема |
|---------|----------|
| **Эмодзи** | В `balance-summary.tsx` (📈 📉 💰) и `transaction-list.tsx` (🗑️) — непоследовательно, плохо масштабируются, не соответствуют премиальному стилю |
| **shadcn/ui** | Частично подключён: есть `Button`, `Card`, `Input`; нет `components.json`, нет `Label`, `Table`, `Badge`, `Select`, `Dialog`, `Alert` |
| **Токены** | CSS-переменные заданы в `globals.css`, но компоненты часто используют хардкод: `text-gray-900`, `bg-blue-600`, `border-gray-200` |
| **Таблица транзакций** | Кастомная HTML-таблица без shadcn `Table`; кнопка удаления — эмодзи |
| **Навигация** | Простой `header` с Tailwind, без единого layout-компонента |
| **Формы** | Смесь `FormField` вручную и shadcn `Input`; нативный `<select>` без shadcn `Select` |
| **Пустые состояния** | Жёлтые alert-блоки (`bg-yellow-50`) вместо нейтральных Apple-style empty states |
| **Админ-панель** | Отдельные карточки без shadcn `Card`; стрелка `←` в тексте кнопки вместо иконки |

### 2.2 Инвентарь эмодзи (обязательная замена)

| Файл | Эмодзи | Замена (Lucide) |
|------|--------|-----------------|
| `src/components/balance-summary.tsx` | 📈 | `TrendingUp` |
| `src/components/balance-summary.tsx` | 📉 | `TrendingDown` |
| `src/components/balance-summary.tsx` | 💰 | `Wallet` |
| `src/components/transaction-list.tsx` | 🗑️ | `Trash2` в `Button variant="ghost" size="icon"` |

**Правило:** после редизайна в `src/` не должно остаться Unicode-эмодзи в UI (поиск по диапазону U+1F300–U+1FAFF и распространённым символам). Символ `+` в тексте кнопки «+ Добавить» заменить на `<Plus className="h-4 w-4" />` + текст «Добавить» или только иконку с `aria-label`.

---

## 3. Цели

1. Инициализировать и стандартизировать shadcn/ui через CLI (`components.json`, актуальные компоненты).
2. Удалить все эмодзи из интерфейса; использовать **lucide-react** (уже в `package.json`).
3. Ввести визуальный язык в духе Apple: нейтральность, типографика, воздух, микроанимации.
4. Унифицировать все экраны: главная, auth, админ-панель — через общие токены и компоненты.
5. Сохранить функциональность без регрессий (CRUD, фильтры, роли, OAuth).

---

## 4. Принципы дизайна (референс apple.com)

| Принцип | Реализация в Money Tracker |
|---------|---------------------------|
| **Минимализм** | Меньше рамок и теней; разделение секций через `Separator` и отступы, не через тяжёлые `shadow-lg` |
| **Воздух** | Контейнер `max-w-5xl` / `max-w-6xl`, вертикальные отступы `py-12`–`py-16` на главных секциях |
| **Типографика** | Системный стек: `font-sans` с `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif`; заголовки `font-semibold tracking-tight`, крупные цифры `text-3xl`–`text-4xl` с `tabular-nums` |
| **Цвет** | Почти монохром: фон `background`, текст `foreground`, акцент — один оттенок (синий Apple `#0071e3` → HSL в `--primary`) |
| **Семантика сумм** | Доход/расход: не кричащие `green-600`/`red-600`, а приглушённые `emerald-600` / `rose-600` или muted + Badge |
| **Интерактивность** | `transition-colors duration-200`, hover без резких скачков; focus ring через shadcn `ring` |
| **Кнопки** | Primary — заливка `primary`; вторичные — `outline` / `ghost`; без эмодзи и без ALL CAPS в навигации |
| **Тёмная тема** | Подготовить CSS-переменные `.dark` (уже есть в `globals.css`); опционально переключатель в v2 |

---

## 5. Техническая база: shadcn CLI

Документация: [shadcn CLI](https://ui.shadcn.com/docs/cli).

### 5.1 Инициализация (если нет `components.json`)

```bash
npx shadcn@latest init -y -d
```

Ожидаемый результат:
- Файл `components.json` в корне проекта
- Подтверждение путей: `src/components/ui`, `src/lib/utils.ts`
- Согласованность с **Tailwind CSS 4** и **Next.js 16**

Проверка:

```bash
npx shadcn@latest info
```

### 5.2 Добавление компонентов

```bash
npx shadcn@latest add label table badge select separator alert alert-dialog dialog dropdown-menu skeleton sonner -y
```

| Компонент | Назначение в проекте |
|-----------|---------------------|
| `label` | Подписи полей в формах auth и транзакций |
| `table` | Список транзакций, таблица пользователей в админке |
| `badge` | Тип транзакции (доход/расход), статус пользователя |
| `select` | Фильтр категорий, поля формы |
| `separator` | Разделители в auth layout, секциях |
| `alert` | Ошибки, пустые состояния, migration notice |
| `alert-dialog` | Подтверждение удаления транзакции (вместо `window.confirm`) |
| `dialog` | Форма добавления/редактирования транзакции (опционально вместо inline-формы) |
| `dropdown-menu` | Действия в строке таблицы (редактировать / удалить) |
| `skeleton` | Загрузка списков |
| `sonner` | Toast после успешного CRUD |

### 5.3 Миграция Radix (при необходимости)

Если CLI предложит unified `radix-ui`:

```bash
npx shadcn@latest migrate radix -y
```

---

## 6. Design tokens

### 6.1 Обновление `globals.css`

Заменить дефолтную палитру shadcn на Apple-inspired (светлая тема):

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 7%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 7%;
  --primary: 211 100% 50%;        /* ~ #0077ED */
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 7%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --accent: 0 0% 96%;
  --accent-foreground: 0 0% 7%;
  --destructive: 0 72% 51%;
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: 211 100% 50%;
  --radius: 0.75rem;              /* 12px — мягче, ближе к Apple */
}
```

### 6.2 Типографика в `layout.tsx`

```tsx
<body className="min-h-screen bg-background font-sans antialiased">
```

Добавить в `globals.css`:

```css
@layer base {
  body {
    font-feature-settings: "kern" 1, "liga" 1;
  }
  .text-balance-display {
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
}
```

### 6.3 Запреты в новом коде

- Не использовать эмодзи в UI
- Не использовать произвольные `text-blue-600`, `bg-gray-50` — только `text-primary`, `bg-muted`, `text-muted-foreground` и семантические цвета через Badge
- Не дублировать компоненты вне `src/components/ui/` для базовых примитивов

---

## 7. Карта экранов и требования

### 7.1 Глобальный layout

**Файлы:** `src/app/layout.tsx`, `src/components/nav-bar.tsx`

| ID | Требование |
|----|------------|
| UI-L1 | `NavBar`: высота ~56px, `border-b border-border`, фон `bg-background/80 backdrop-blur-md` (glass) |
| UI-L2 | Логотип/название: `text-lg font-semibold tracking-tight`, без жирного `font-bold` |
| UI-L3 | Ссылки навигации: `text-sm text-muted-foreground hover:text-foreground transition-colors` |
| UI-L4 | Кнопка «Выйти»: `Button variant="ghost" size="sm"` |
| UI-L5 | Подключить `<Toaster />` из `sonner` в root layout |

### 7.2 Главная страница `/`

**Файлы:** `src/app/home-content.tsx`, `balance-summary.tsx`, `transaction-list.tsx`, `transaction-form.tsx`

| ID | Требование |
|----|------------|
| UI-H1 | Фон страницы: `bg-background`, контейнер `max-w-5xl mx-auto px-6 py-12` |
| UI-H2 | Заголовок секции (опционально): «Транзакции» — `text-2xl font-semibold tracking-tight` |
| UI-H3 | Кнопка «Добавить»: `Button` + иконка `Plus`, без символа `+` в тексте |
| UI-H4 | Фильтры: `Button` toggle group + shadcn `Select` для категории |
| UI-H5 | `BalanceSummary`: три `Card` с иконками Lucide в `CardHeader`; суммы — класс `text-balance-display` |
| UI-H6 | `TransactionList`: shadcn `Table`; удаление — `AlertDialog` + `Trash2` |
| UI-H7 | Пустое состояние: `Alert` variant default или кастомный блок с `text-muted-foreground`, без жёлтого фона |
| UI-H8 | Ошибки действий: `Alert` destructive или toast через Sonner |

### 7.3 Auth `/auth/login`, `/auth/register`

**Файлы:** `login-form.tsx`, `register-form.tsx`, `auth/layout.tsx`, `google-sign-in-button.tsx`

| ID | Требование |
|----|------------|
| UI-A1 | Центрированный layout: `min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4` |
| UI-A2 | Карточка формы: `Card` с увеличенным padding, без лишних теней — `shadow-sm` или `border only` |
| UI-A3 | Поля: `Label` + `Input`; ошибки — `Alert` destructive |
| UI-A4 | Ссылки «Зарегистрироваться» / «Войти»: `text-primary hover:underline` |
| UI-A5 | Google-кнопка: outline-стиль, иконка Lucide `Chrome` или официальный SVG (без эмодзи) |

### 7.4 Админ-панель `/admin`

**Файлы:** `admin/page.tsx`, `admin-stats.tsx`, `users-table.tsx`, `user-actions.tsx`, `access-denied.tsx`, `migration-notice.tsx`

| ID | Требование |
|----|------------|
| UI-D1 | Заголовок страницы: «Администрирование» — крупная типографика Apple-style |
| UI-D2 | `AdminStats`: перевести на shadcn `Card` (как `BalanceSummary`) |
| UI-D3 | `UsersTable`: shadcn `Table` + `Badge` для role/status |
| UI-D4 | Кнопка «К транзакциям»: `Button variant="ghost"` + `ArrowLeft` вместо `←` |
| UI-D5 | `AccessDenied` / `MigrationNotice`: shadcn `Alert` |

---

## 8. Пользовательские истории

- **US-UI-1:** Как пользователь, я хочу видеть чистый интерфейс без эмодзи, чтобы приложение выглядело профессионально.
- **US-UI-2:** Как пользователь, я хочу легко читать суммы и баланс с крупной типографикой.
- **US-UI-3:** Как пользователь, я хочу понятные иконки действий (удалить, добавить) с подсказками для screen readers.
- **US-UI-4:** Как пользователь, я хочу единый стиль на всех страницах (главная, вход, админка).
- **US-UI-5:** Как пользователь, я хочу подтверждение удаления в модальном окне, а не в системном `alert()`.

---

## 9. Функциональные требования

| ID | Требование | Приоритет |
|----|------------|-----------|
| FR-UI-1 | Выполнить `shadcn init` и добавить перечисленные компоненты | P0 |
| FR-UI-2 | Заменить все эмодзи на Lucide (см. §2.2) | P0 |
| FR-UI-3 | Обновить CSS-переменные под Apple-палитру | P0 |
| FR-UI-4 | Рефакторинг `TransactionList` на shadcn Table | P0 |
| FR-UI-5 | Рефакторинг фильтров на shadcn Select | P1 |
| FR-UI-6 | `AlertDialog` для удаления транзакции | P1 |
| FR-UI-7 | Sonner toast при успешном add/update/delete | P2 |
| FR-UI-8 | Skeleton при загрузке транзакций | P2 |
| FR-UI-9 | Опционально: форма транзакции в `Dialog` вместо inline-блока | P3 |

---

## 10. Нефункциональные требования

| ID | Требование |
|----|------------|
| NFR-UI-1 | Lighthouse Accessibility ≥ 90 на главной |
| NFR-UI-2 | Контраст текста WCAG AA |
| NFR-UI-3 | Все icon-only кнопки: `aria-label` на русском |
| NFR-UI-4 | Не увеличивать bundle более чем на ~50 KB gzip от новых shadcn-компонентов |
| NFR-UI-5 | Поддержка `prefers-reduced-motion` для анимаций |

---

## 11. План реализации

### Фаза 1 — Фундамент (1–2 дня)

1. `npx shadcn@latest init`
2. `npx shadcn@latest add label table badge select alert alert-dialog separator -y`
3. Обновить `globals.css` (токены §6.1)
4. Заменить эмодзи в `balance-summary.tsx` и `transaction-list.tsx`

### Фаза 2 — Главная страница (2–3 дня)

1. Рефакторинг `TransactionList` → Table
2. Фильтры → Select + Button group
3. Пустые состояния и ошибки → Alert
4. `AlertDialog` для удаления
5. NavBar по UI-L1–L4

### Фаза 3 — Auth и Admin (1–2 дня)

1. Auth forms: Label, унификация Card
2. Admin: Card stats, Table users, Alert components
3. Sonner в layout

### Фаза 4 — Полировка (1 день)

1. Skeleton loaders
2. Проход по a11y (aria-label, focus)
3. Визуальный QA на mobile / tablet / desktop

---

## 12. Критерии приёмки

- [ ] В репозитории есть `components.json`, CLI `shadcn info` без ошибок
- [ ] Поиск эмодзи в `src/**/*.tsx` — 0 совпадений в UI-компонентах
- [ ] Все страницы используют `bg-background`, `text-foreground`, `border-border`
- [ ] `BalanceSummary` и `AdminStats` визуально согласованы (shadcn Card + Lucide)
- [ ] Таблица транзакций — shadcn Table; удаление через AlertDialog
- [ ] Нет `window.confirm` для удаления транзакции
- [ ] `npm run build` проходит без ошибок
- [ ] Ручной smoke-test: CRUD транзакций, фильтры, login/logout, admin (если роль admin)

---

## 13. Вне скоупа (v1 редизайна)

- Полноценная тёмная тема с переключателем в UI
- Кастомные иллюстрации и 3D-графика как на apple.com
- Ребрендинг названия приложения
- Локализация на английский
- Анимации scroll-driven (Framer Motion)

---

## 14. Риски и митигация

| Риск | Митигация |
|------|-----------|
| Конфликт Tailwind 4 и shadcn init | Запускать init с `-d`; сверить `components.json` с документацией Tailwind v4 |
| Перезапись существующих `ui/button.tsx` | Использовать `add` без `--overwrite`; при конфликте — `diff` через `npx shadcn@latest add button --diff` |
| Регрессия auth/admin | Чеклист smoke-test после каждой фазы |
| Рост bundle | Добавлять только нужные компоненты из §5.2 |

---

## 15. Связанные файлы

```
src/
├── app/
│   ├── globals.css              ← токены, типографика
│   ├── layout.tsx               ← Toaster, font-sans
│   ├── home-content.tsx
│   ├── admin/page.tsx
│   └── auth/
├── components/
│   ├── ui/                      ← shadcn (расширить)
│   ├── balance-summary.tsx      ← эмодзи → Lucide
│   ├── transaction-list.tsx     ← эмодзи → Lucide, Table
│   ├── transaction-form.tsx
│   ├── nav-bar.tsx
│   └── admin/
├── lib/utils.ts
components.json                  ← создать через CLI
```

---

## 16. Команды для Task Master

После сохранения PRD:

```bash
task-master parse-prd .taskmaster/docs/prd-4-design-shadcn-apple.md
```

Рекомендуемое разбиение на задачи (8–10):

1. Init shadcn + components.json  
2. Add shadcn primitives (batch CLI)  
3. Design tokens + globals.css  
4. Replace emojis → Lucide (balance + list)  
5. Refactor TransactionList + delete AlertDialog  
6. Refactor home filters + empty states  
7. NavBar + root layout (Sonner)  
8. Auth pages polish  
9. Admin panel polish  
10. QA + a11y pass  

---

*Документ подготовлен для Money Tracker. CLI-справка: [ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli).*
