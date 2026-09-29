import { canEditBoard, canManageMembers, canRemoveMember } from '@/features/boards/permissions'

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
})
