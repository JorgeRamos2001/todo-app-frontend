import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/client'
import { createColumn, deleteColumn, updateColumn, type UpdateColumnRequest } from '@/api/columns'
import { queryKeys } from '@/lib/query-keys'

export function useCreateColumn(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createColumn(boardId, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
  })
}

export function useUpdateColumn(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ columnId, body }: { columnId: number; body: UpdateColumnRequest }) =>
      updateColumn(boardId, columnId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
      }
    },
  })
}

export function useDeleteColumn(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (columnId: number) => deleteColumn(boardId, columnId),
    onSuccess: async () => {
      toast.success('Column deleted')
      await queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
      }
    },
  })
}
