import type { BoardRole } from '@/api/boards'

export function canEditBoard(role: BoardRole): boolean {
  return role === 'OWNER'
}

export function canManageMembers(role: BoardRole): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canRemoveMember(actorRole: BoardRole, targetRole: BoardRole): boolean {
  if (actorRole === 'OWNER') {
    return targetRole !== 'OWNER'
  }
  if (actorRole === 'ADMIN') {
    return targetRole === 'MEMBER'
  }
  return false
}
