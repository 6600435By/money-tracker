# AGENTS.md - Money Tracker Project Guide

## Project Overview

Money Tracker is a Next.js 16 web application for personal finance management. It allows users to track income and expenses, view balance summaries, and manage transactions. The application includes user authentication, role-based access control, and an admin panel for user management.

**Tech Stack:**
- Next.js 16 with App Router and TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui components (Button, Card, Input, etc.)
- Supabase (PostgreSQL + Row Level Security)
- @supabase/ssr for authentication
- Zod for validation
- React 18 with hooks

## Essential Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Database Setup (Supabase)
1. Create a new Supabase project
2. Add environment variables to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Run SQL migrations from `.taskmaster/` directory:
   ```bash
   # Basic schema (no auth)
   .taskmaster/database-schema.sql
   
   # Full auth, roles, and user isolation
   .taskmaster/database-migration-auth.sql
   ```

### Task Management
The project uses Task Master for task management. Configuration and tasks are in `.taskmaster/` directory.

## Architecture and Structure

### Application Flow
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page wrapper with Suspense
│   ├── home-content.tsx    # Main application logic
│   ├── layout.tsx         # Root layout
│   ├── actions/           # Server Actions for auth
│   ├── admin/             # Admin pages
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/                # shadcn/ui base components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication components
│   └── *.tsx              # Core app components
└── lib/                   # Utility libraries
    ├── supabase/          # Supabase client setup
    ├── auth.ts            # Authentication utilities
    ├── types.ts           # TypeScript definitions
    └── utils.ts           # Utility functions
```

### Component Organization
- **Server Components**: Used for data fetching and layout where no client-side interactivity is needed
- **Client Components**: Components requiring hooks, state, or event handlers (marked with `'use client'`)
- **Actions**: Server Actions in `app/actions.ts` handle all CRUD operations for transactions
- **Type Safety**: Comprehensive TypeScript types in `lib/types.ts`

## Database Schema

### Core Tables

#### `transactions`
```sql
- id: BIGINT (PK, auto-increment)
- amount: NUMERIC(10,2) (required)
- type: TEXT ('income' | 'expense') (required)
- category: TEXT (required)
- description: TEXT (optional, max 280 chars)
- date: DATE (required)
- user_id: UUID (references auth.users) - added after auth migration
- created_at: TIMESTAMPTZ (auto)
```

#### `profiles` (after auth migration)
```sql
- id: BIGINT (PK, auto-increment)
- user_id: UUID (references auth.users, unique)
- email: TEXT (required)
- role: TEXT ('admin' | 'user', default 'user')
- status: TEXT ('active' | 'blocked', default 'active')
- created_at: TIMESTAMPTZ (auto)
```

### Row Level Security (RLS)
- **Basic mode**: Open access for educational purposes
- **Auth mode**: User isolation via `auth.uid() = user_id`
- **Admin mode**: Admin access to all user data via `is_admin()` function

## Authentication and Authorization

### Authentication Flow
1. **Middleware Protection**: All non-auth routes require authentication
2. **Google OAuth**: Implemented via Supabase Auth
3. **Profile Creation**: Automatic profile creation on user registration
4. **Role Management**: Admin role with elevated privileges

### Authorization Patterns
```typescript
// Admin check in components
const profile = await getUserProfile()
if (profile?.role !== 'admin') {
  return <AccessDenied />
}

// RLS policies automatically enforce data access
// Basic: All access allowed
// Auth: Users can only access their own data
```

## Code Patterns and Conventions

### Server Actions Pattern
```typescript
// All CRUD operations in app/actions.ts
export async function addTransaction(data: CreateTransactionData): Promise<ActionResult> {
  // Validation with Zod
  const validatedData = transactionSchema.parse(data)
  
  // Database operation
  const { error } = await supabase.from('transactions').insert([row])
  
  // Error handling and revalidation
  if (error) return { error: mapDbError(error.message) }
  revalidatePath('/')
  return { success: true }
}
```

### Component Patterns
```typescript
// Client components use hooks and state
export default function HomeContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  
  // Data fetching and state management
  useEffect(() => {
    loadTransactions()
  }, [filters])
}

// Form with Server Action
<TransactionForm 
  onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
  onCancel={() => setShowForm(false)}
  initialData={editingTransaction || undefined}
/>
```

### Error Handling Patterns
```typescript
// Map database errors to user-friendly messages
function mapDbError(message: string): string {
  if (message.includes("user_id") && message.includes('schema cache')) {
    return 'Выполните SQL-миграцию в Supabase: .taskmaster/database-migration-auth.sql'
  }
  if (message.includes('row-level security')) {
    return 'Нет доступа к данным. Проверьте RLS-политики в Supabase.'
  }
  return 'Не удалось сохранить транзакцию'
}
```

## Key Features

### Transaction Management
- **CRUD Operations**: Full create, read, update, delete functionality
- **Real-time Updates**: Uses `revalidatePath('/')` for immediate UI updates
- **Form Validation**: Zod schemas for both client and server validation
- **Filtering**: URL-based filters for transaction type and category

### User Management
- **Role-based Access**: Admin vs regular user permissions
- **Status Management**: Active/blocked user status
- **Admin Panel**: User management interface for administrators

### Data Filtering and Search
```typescript
// URL-based filtering
const typeFilter = searchParams.get('type') || ''
const categoryFilter = searchParams.get('category') || ''

// Filter application in data fetching
if (filters?.type) {
  query = query.eq('type', filters.type)
}
if (filters?.category) {
  query = query.eq('category', filters.category)
}
```

## Important Gotchas and Non-Obvious Patterns

### Database Migration Issues
1. **Schema Versioning**: The app supports both basic and auth-enabled database schemas
2. **Migration Order**: Must run `database-schema.sql` before `database-migration-auth.sql`
3. **Error Handling**: Special handling for missing `user_id` column during migration
4. **RLS Policies**: Different policies for educational vs production mode

### Authentication Middleware
```typescript
// Middleware enforces auth on all routes except /auth/
// Redirects unauthenticated users to /auth/login
// Redirects authenticated users away from auth routes
```

### Component Loading States
- **Suspense Boundaries**: Used for loading states in client components
- **Loading States**: Manual loading state management for async operations
- **Error Boundaries**: Error handling for failed data fetching

### Internationalization
- **Language**: Russian language throughout the interface
- **Date Format**: Russian date conventions
- **Currency**: Russian ruble (₽) formatting

### Development Environment
- **Environment Variables**: Supabase credentials in `.env.local`
- **Development vs Production**: Different database configurations
- **Hot Reloading**: Next.js dev server with full hot reload

## Testing and Quality Assurance

### Current Testing Status
- No formal test suite implemented
- Manual testing via browser interface
- Database validation through SQL migrations

### Recommended Testing Approach
1. **Component Testing**: Test individual components with React Testing Library
2. **Integration Testing**: Test Server Actions with database mocking
3. **E2E Testing**: Test user flows with Playwright or Cypress

## Development Workflow

### Starting a New Feature
1. Check existing PRDs in `.taskmaster/docs/`
2. Create tasks in `.taskmaster/tasks.json`
3. Implement following established patterns
4. Test with sample data from `database-schema.sql`
5. Update documentation if needed

### Common Development Tasks
- **Adding New Categories**: Update `CATEGORIES` array in `lib/types.ts`
- **Modifying Transaction Schema**: Update both Zod schema and database schema
- **Styling Changes**: Use Tailwind CSS classes, shadcn/ui components
- **New Admin Features**: Implement with role-based access control

### Database Debugging
- Check RLS policies in Supabase dashboard
- Verify migration execution order
- Use Supabase SQL Editor for manual queries
- Review error messages in browser console

## Environment Setup

### Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Initial Database Setup
1. Create Supabase project
2. Run `.taskmaster/database-schema.sql` for basic setup
3. Run `.taskmaster/database-migration-auth.sql` for full auth setup
4. Add sample data for testing

### Development Dependencies
All dependencies are managed through `package.json`. No additional setup required beyond `npm install`.

## Performance Considerations

### Optimizations
- **Server Components**: Minimize client-side JavaScript
- **Suspense Boundaries**: Graceful loading states
- **Database Indexing**: Proper indexing on frequently queried fields
- **Caching**: Next.js caching for static data

### Potential Issues
- Large datasets may require pagination
- Real-time updates could impact performance with many users
- Database queries should be optimized for filtering