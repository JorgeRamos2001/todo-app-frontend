import type { Column } from '@/api/columns'
import { apiRequest } from '@/api/client'

export type BoardType = 'PERSONAL' | 'COLLABORATIVE'
export type BoardRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface BoardSummary {
  id: number
  title: string
  type: BoardType
  ownerId: number
  role: BoardRole
}

export interface BoardMember {
  id: number
  userId: number
  name: string
  email: string
  role: BoardRole
}

export interface BoardDetail {
  id: number
  title: string
  description: string | null
  type: BoardType
  ownerId: number
  members: BoardMember[]
  columns: Column[]
}

export interface CreateBoardRequest {
  title: string
  description?: string
  type: BoardType
}

export interface UpdateBoardRequest {
  title?: string
  description?: string
}

export function fetchBoards(): Promise<BoardSummary[]> {
  return apiRequest<BoardSummary[]>('/api/v1/boards')
}

export function fetchBoard(boardId: number): Promise<BoardDetail> {
  return apiRequest<BoardDetail>(`/api/v1/boards/${boardId}`)
}

export function createBoard(body: CreateBoardRequest): Promise<BoardDetail> {
  return apiRequest<BoardDetail>('/api/v1/boards', { method: 'POST', body })
}

export function updateBoard(boardId: number, body: UpdateBoardRequest): Promise<BoardDetail> {
  return apiRequest<BoardDetail>(`/api/v1/boards/${boardId}`, { method: 'PATCH', body })
}

export function deleteBoard(boardId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/boards/${boardId}`, { method: 'DELETE' })
}

export function fetchBoardMembers(boardId: number): Promise<BoardMember[]> {
  return apiRequest<BoardMember[]>(`/api/v1/boards/${boardId}/members`)
}

export function removeBoardMember(boardId: number, memberId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/boards/${boardId}/members/${memberId}`, { method: 'DELETE' })
}
