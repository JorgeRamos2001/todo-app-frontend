import { apiRequest } from '@/api/client'

export interface Task {
  id: number
  columnId: number
  title: string
  description: string | null
  position: number
  assigneeId: number | null
  assigneeName: string | null
  createdById: number
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  columnId?: number
  position?: number
}

export function createTask(columnId: number, body: CreateTaskRequest): Promise<Task> {
  return apiRequest<Task>(`/api/v1/columns/${columnId}/tasks`, { method: 'POST', body })
}

export function updateTask(taskId: number, body: UpdateTaskRequest): Promise<Task> {
  return apiRequest<Task>(`/api/v1/tasks/${taskId}`, { method: 'PATCH', body })
}

export function deleteTask(taskId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/tasks/${taskId}`, { method: 'DELETE' })
}

export function assignTask(taskId: number, userId: number): Promise<Task> {
  return apiRequest<Task>(`/api/v1/tasks/${taskId}/assignee`, {
    method: 'POST',
    body: { userId },
  })
}
