import type { Invitation } from '@/api/invitations'

export function isOpenInvitation(invitation: Invitation): boolean {
  return invitation.status === 'PENDING' && new Date(invitation.expiresAt).getTime() > Date.now()
}

export function openInvitationCount(invitations: Invitation[]): number {
  return invitations.filter(isOpenInvitation).length
}
