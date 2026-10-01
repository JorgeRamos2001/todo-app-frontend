import { apiRequest } from '@/api/client'

export interface Subtask {
  id: number
  taskId: number
  title: string
  done: boolean
  position: number
}

export interface CreateSubtaskRequest {
  title: string
}

export interface UpdateSubtaskRequest {
  title?: string
  done?: boolean
  position?: number
}

export function fetchSubtasks(taskId: number): Promise<Subtask[]> {
  return apiRequest<Subtask[]>(`/api/v1/tasks/${taskId}/subtasks`)
}

export function createSubtask(taskId: number, body: CreateSubtaskRequest): Promise<Subtask> {
  return apiRequest<Subtask>(`/api/v1/tasks/${taskId}/subtasks`, { method: 'POST', body })
}

export function updateSubtask(
  taskId: number,
  subtaskId: number,
  body: UpdateSubtaskRequest,
): Promise<Subtask> {
  return apiRequest<Subtask>(`/api/v1/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'PATCH',
    body,
  })
}

export function deleteSubtask(taskId: number, subtaskId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' })
}
