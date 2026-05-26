import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function MigrationNotice({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mb-8">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>База не настроена</AlertTitle>
      <AlertDescription className="mt-1 space-y-2">
        <p>{message}</p>
        <p className="text-sm">
          Выполните SQL-скрипты:{' '}
          <code className="bg-destructive/10 px-1 rounded text-xs">
            .taskmaster/database-migration-auth.sql
          </code>
          , при необходимости{' '}
          <code className="bg-destructive/10 px-1 rounded text-xs">
            database-migration-subscription.sql
          </code>{' '}
          и{' '}
          <code className="bg-destructive/10 px-1 rounded text-xs">
            database-migration-admin-analytics.sql
          </code>
        </p>
      </AlertDescription>
    </Alert>
  )
}
