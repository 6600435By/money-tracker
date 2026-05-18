'use client'

import { useState } from 'react'
import { blockUser, unblockUser, deleteUser } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/types'

interface UserActionsProps {
  user: Profile
  currentUserId: string
}

export default function UserActions({ user, currentUserId }: UserActionsProps) {
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user.user_id === currentUserId) {
    return <span className="text-sm text-gray-400">—</span>
  }

  async function runAction(action: () => Promise<void>) {
    setLoading(true)
    setError(null)
    try {
      await action()
      setConfirmDelete(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {user.status === 'active' ? (
        <Button
          size="sm"
          variant="outline"
          className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          disabled={loading}
          onClick={() => runAction(() => blockUser(user.user_id))}
        >
          Заблокировать
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
          disabled={loading}
          onClick={() => runAction(() => unblockUser(user.user_id))}
        >
          Разблокировать
        </Button>
      )}

      {!confirmDelete ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={loading}
          onClick={() => setConfirmDelete(true)}
        >
          Удалить
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          disabled={loading}
          onClick={() => runAction(() => deleteUser(user.user_id))}
        >
          Подтвердить
        </Button>
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
