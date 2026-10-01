import { useEffect, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/auth/store'
import { queryKeys } from '@/lib/query-keys'
import { subscribeToBoard, type RealtimeStatus } from '@/realtime/client'
import { invalidationKeys } from '@/realtime/events'

export function useBoardRealtime(boardId: number | null): RealtimeStatus {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const [connectionStatus, setConnectionStatus] = useState<RealtimeStatus>('connecting')

  useEffect(() => {
    if (boardId === null || accessToken === null) {
      return
    }

    return subscribeToBoard({
      boardId,
      token: accessToken,
      onStatus: setConnectionStatus,
      onReconnect: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
        void queryClient.invalidateQueries({ queryKey: ['tasks'] })
        void queryClient.invalidateQueries({ queryKey: queryKeys.invitations })
      },
      onEvent: (event) => {
        for (const key of invalidationKeys(event)) {
          void queryClient.invalidateQueries({ queryKey: key })
        }
      },
    })
  }, [accessToken, boardId, queryClient])

  if (boardId === null || accessToken === null) {
    return 'offline'
  }

  return connectionStatus
}
