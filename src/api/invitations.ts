import type { BoardRole } from '@/api/boards'
import { apiRequest } from '@/api/client'

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export interface Invitation {
  id: number
  boardId: number
  boardTitle: string
  inviterName: string
  inviteeEmail: string
  role: BoardRole
  status: InvitationStatus
  token: string
  expiresAt: string
}

export interface CreateInvitationRequest {
  email: string
  role: 'ADMIN' | 'MEMBER'
}

export function fetchReceivedInvitations(): Promise<Invitation[]> {
  return apiRequest<Invitation[]>('/api/v1/invitations')
}

export function fetchBoardInvitations(boardId: number): Promise<Invitation[]> {
  return apiRequest<Invitation[]>(`/api/v1/boards/${boardId}/invitations`)
}

export function createInvitation(
  boardId: number,
  body: CreateInvitationRequest,
): Promise<Invitation> {
  return apiRequest<Invitation>(`/api/v1/boards/${boardId}/invitations`, {
    method: 'POST',
    body,
  })
}

export function acceptInvitation(token: string): Promise<Invitation> {
  return apiRequest<Invitation>(`/api/v1/invitations/${token}/accept`, { method: 'POST' })
}

export function rejectInvitation(token: string): Promise<Invitation> {
  return apiRequest<Invitation>(`/api/v1/invitations/${token}/reject`, { method: 'POST' })
}
