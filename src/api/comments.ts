import { apiRequest } from '@/api/client'

export interface TaskComment {
  id: number
  taskId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

export function fetchComments(taskId: number): Promise<TaskComment[]> {
  return apiRequest<TaskComment[]>(`/api/v1/tasks/${taskId}/comments`)
}

export function createComment(taskId: number, content: string): Promise<TaskComment> {
  return apiRequest<TaskComment>(`/api/v1/tasks/${taskId}/comments`, {
    method: 'POST',
    body: { content },
  })
}

export function deleteComment(taskId: number, commentId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/tasks/${taskId}/comments/${commentId}`, { method: 'DELETE' })
}
