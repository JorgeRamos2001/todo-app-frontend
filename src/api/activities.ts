import { apiRequest } from '@/api/client'

export type BoardActivityAction =
  | 'BOARD_CREATED'
  | 'BOARD_UPDATED'
  | 'MEMBER_JOINED'
  | 'MEMBER_REMOVED'
  | 'COLUMN_CREATED'
  | 'COLUMN_UPDATED'
  | 'COLUMN_DELETED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_MOVED'
  | 'TASK_ASSIGNED'
  | 'TASK_DELETED'
  | 'SUBTASK_CREATED'
  | 'SUBTASK_UPDATED'
  | 'SUBTASK_DELETED'
  | 'COMMENT_CREATED'
  | 'COMMENT_DELETED'
  | 'INVITATION_CREATED'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_REJECTED'

export type BoardActivityEntityType =
  'BOARD' | 'MEMBER' | 'COLUMN' | 'TASK' | 'SUBTASK' | 'COMMENT' | 'INVITATION'

export interface BoardActivity {
  id: number
  action: BoardActivityAction
  entityType: BoardActivityEntityType
  entityId: number | null
  actorId: number
  actorName: string
  details: Record<string, unknown> | null
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export function fetchBoardActivities(
  boardId: number,
  page: number,
  size = 20,
): Promise<PageResponse<BoardActivity>> {
  return apiRequest<PageResponse<BoardActivity>>(
    `/api/v1/boards/${boardId}/activities?page=${page}&size=${size}`,
  )
}
