import type { Task } from '@/api/tasks'
import {
  canAssignTask,
  canCreateTask,
  canDeleteComment,
  canDeleteTask,
  canEditBoard,
  canEditTask,
  canManageColumns,
  canManageMembers,
  canRemoveMember,
} from '@/features/boards/permissions'

const task = (assigneeId: number | null): Task => ({
  id: 1,
  columnId: 1,
  title: 'Task',
  description: null,
  position: 0,
  assigneeId,
  assigneeName: assigneeId === null ? null : 'Ada',
  createdById: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
})

describe('board permissions', () => {
  it('only owners can edit or delete a board', () => {
    expect(canEditBoard('OWNER')).toBe(true)
    expect(canEditBoard('ADMIN')).toBe(false)
    expect(canEditBoard('MEMBER')).toBe(false)
  })

  it('owners and admins can manage members', () => {
    expect(canManageMembers('OWNER')).toBe(true)
    expect(canManageMembers('ADMIN')).toBe(true)
    expect(canManageMembers('MEMBER')).toBe(false)
  })

  it('owners can remove anyone but the owner', () => {
    expect(canRemoveMember('OWNER', 'ADMIN')).toBe(true)
    expect(canRemoveMember('OWNER', 'MEMBER')).toBe(true)
    expect(canRemoveMember('OWNER', 'OWNER')).toBe(false)
  })

  it('admins can only remove members and members cannot remove anyone', () => {
    expect(canRemoveMember('ADMIN', 'MEMBER')).toBe(true)
    expect(canRemoveMember('ADMIN', 'ADMIN')).toBe(false)
    expect(canRemoveMember('MEMBER', 'MEMBER')).toBe(false)
  })

  it('only owners and admins manage columns, create tasks and assign', () => {
    expect(canManageColumns('OWNER')).toBe(true)
    expect(canManageColumns('ADMIN')).toBe(true)
    expect(canManageColumns('MEMBER')).toBe(false)
    expect(canCreateTask('MEMBER')).toBe(false)
    expect(canDeleteTask('MEMBER')).toBe(false)
    expect(canAssignTask('MEMBER')).toBe(false)
  })

  it('members can only edit or move tasks assigned to them', () => {
    expect(canEditTask('MEMBER', task(7), 7)).toBe(true)
    expect(canEditTask('MEMBER', task(8), 7)).toBe(false)
    expect(canEditTask('MEMBER', task(null), 7)).toBe(false)
    expect(canEditTask('ADMIN', task(null), 7)).toBe(true)
  })

  it('members can only delete their own comments', () => {
    expect(canDeleteComment('MEMBER', 7, 7)).toBe(true)
    expect(canDeleteComment('MEMBER', 8, 7)).toBe(false)
    expect(canDeleteComment('ADMIN', 8, 7)).toBe(true)
    expect(canDeleteComment('OWNER', 8, 7)).toBe(true)
  })
})
