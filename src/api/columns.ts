import { apiRequest } from '@/api/client'
import type { Task } from '@/api/tasks'

export interface Column {
  id: number
  name: string
  position: number
  tasks: Task[]
}

export interface CreateColumnRequest {
  name: string
}

export interface UpdateColumnRequest {
  name?: string
  position?: number
}

export function createColumn(boardId: number, body: CreateColumnRequest): Promise<Column> {
  return apiRequest<Column>(`/api/v1/boards/${boardId}/columns`, { method: 'POST', body })
}

export function updateColumn(
  boardId: number,
  columnId: number,
  body: UpdateColumnRequest,
): Promise<Column> {
  return apiRequest<Column>(`/api/v1/boards/${boardId}/columns/${columnId}`, {
    method: 'PATCH',
    body,
  })
}

export function deleteColumn(boardId: number, columnId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/boards/${boardId}/columns/${columnId}`, { method: 'DELETE' })
}
