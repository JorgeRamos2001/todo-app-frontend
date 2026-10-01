import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { fetchBoardActivities } from '@/api/activities'

import {
  createBoard,
  deleteBoard,
  fetchBoard,
  fetchBoards,
  removeBoardMember,
  updateBoard,
  type CreateBoardRequest,
  type UpdateBoardRequest,
} from '@/api/boards'
import { ApiError } from '@/api/client'
import { queryKeys } from '@/lib/query-keys'

export function useBoards() {
  return useQuery({
    queryKey: queryKeys.boards,
    queryFn: fetchBoards,
  })
}

export function useBoard(boardId: number | null) {
  return useQuery({
    queryKey: queryKeys.board(boardId ?? -1),
    queryFn: () => fetchBoard(boardId ?? -1),
    enabled: boardId !== null,
  })
}

export function useBoardActivities(boardId: number, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.boardActivities(boardId),
    queryFn: ({ pageParam }) => fetchBoardActivities(boardId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled,
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateBoardRequest) => createBoard(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.boards }),
  })
}

export function useUpdateBoard(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateBoardRequest) => updateBoard(boardId, body),
    onSuccess: async () => {
      toast.success('Board updated')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.boards }),
        queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
      ])
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
      }
    },
  })
}

export function useDeleteBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (boardId: number) => deleteBoard(boardId),
    onSuccess: async () => {
      toast.success('Board deleted')
      await queryClient.invalidateQueries({ queryKey: queryKeys.boards })
    },
    onError: (error, boardId) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
      }
    },
  })
}

export function useRemoveBoardMember(boardId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: number) => removeBoardMember(boardId, memberId),
    onSuccess: async () => {
      toast.success('Member removed')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.boardMembers(boardId) }),
      ])
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
      }
    },
  })
}
