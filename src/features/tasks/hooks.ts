import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/client'
import { createComment, deleteComment, fetchComments } from '@/api/comments'
import {
  createSubtask,
  deleteSubtask,
  fetchSubtasks,
  updateSubtask,
  type UpdateSubtaskRequest,
} from '@/api/subtasks'
import {
  assignTask,
  createTask,
  deleteTask,
  updateTask,
  type CreateTaskRequest,
  type UpdateTaskRequest,
} from '@/api/tasks'
import { queryKeys } from '@/lib/query-keys'

function useBoardInvalidation(boardId: number) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
  }
}

function useBoardRefetchOnConflict(boardId: number) {
  const queryClient = useQueryClient()
  return (error: unknown) => {
    if (error instanceof ApiError && error.status === 409) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    }
  }
}

export function useCreateTask(boardId: number) {
  const invalidateBoard = useBoardInvalidation(boardId)

  return useMutation({
    mutationFn: ({ columnId, body }: { columnId: number; body: CreateTaskRequest }) =>
      createTask(columnId, body),
    onSuccess: invalidateBoard,
    onError: useBoardRefetchOnConflict(boardId),
  })
}

export function useUpdateTask(boardId: number) {
  const invalidateBoard = useBoardInvalidation(boardId)
  const onConflict = useBoardRefetchOnConflict(boardId)

  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: number; body: UpdateTaskRequest }) =>
      updateTask(taskId, body),
    onSuccess: invalidateBoard,
    onError: onConflict,
  })
}

export function useDeleteTask(boardId: number) {
  const invalidateBoard = useBoardInvalidation(boardId)
  const onConflict = useBoardRefetchOnConflict(boardId)

  return useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      toast.success('Task deleted')
      invalidateBoard()
    },
    onError: onConflict,
  })
}

export function useAssignTask(boardId: number) {
  const invalidateBoard = useBoardInvalidation(boardId)
  const onConflict = useBoardRefetchOnConflict(boardId)

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: number; userId: number }) =>
      assignTask(taskId, userId),
    onSuccess: invalidateBoard,
    onError: onConflict,
  })
}

export function useSubtasks(taskId: number | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.subtasks(taskId ?? -1),
    queryFn: () => fetchSubtasks(taskId ?? -1),
    enabled: enabled && taskId !== null,
  })
}

export function useCreateSubtask(taskId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => createSubtask(taskId, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.subtasks(taskId) }),
  })
}

export function useUpdateSubtask(taskId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subtaskId, body }: { subtaskId: number; body: UpdateSubtaskRequest }) =>
      updateSubtask(taskId, subtaskId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.subtasks(taskId) }),
  })
}

export function useDeleteSubtask(taskId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subtaskId: number) => deleteSubtask(taskId, subtaskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.subtasks(taskId) }),
  })
}

export function useComments(taskId: number | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.comments(taskId ?? -1),
    queryFn: () => fetchComments(taskId ?? -1),
    enabled: enabled && taskId !== null,
  })
}

export function useCreateComment(taskId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => createComment(taskId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) }),
  })
}

export function useDeleteComment(taskId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(taskId, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) }),
  })
}
