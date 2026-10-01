import type { BoardRole } from '@/api/boards'
import type { Task } from '@/api/tasks'

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

export function canManageColumns(role: BoardRole): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canCreateTask(role: BoardRole): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canDeleteTask(role: BoardRole): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canAssignTask(role: BoardRole): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canEditTask(role: BoardRole, task: Task | null, userId: number | null): boolean {
  if (role === 'OWNER' || role === 'ADMIN') {
    return true
  }
  if (task === null || userId === null) {
    return false
  }
  return task.assigneeId === userId
}

export function canMoveTask(role: BoardRole, task: Task | null, userId: number | null): boolean {
  return canEditTask(role, task, userId)
}

export function canManageSubtasks(
  role: BoardRole,
  task: Task | null,
  userId: number | null,
): boolean {
  return canEditTask(role, task, userId)
}

export function canDeleteComment(
  role: BoardRole,
  authorId: number,
  userId: number | null,
): boolean {
  if (role === 'OWNER' || role === 'ADMIN') {
    return true
  }
  return userId !== null && authorId === userId
}
