export type RealtimeEntityType =
  'BOARD' | 'MEMBER' | 'COLUMN' | 'TASK' | 'SUBTASK' | 'COMMENT' | 'INVITATION'

export interface RealtimeEvent {
  type: string
  boardId: number
  entityType: RealtimeEntityType
  entityId: number | null
  actorId: number
  payload: Record<string, unknown>
  occurredAt: string
}

export function invalidationKeys(event: RealtimeEvent): readonly unknown[][] {
  switch (event.entityType) {
    case 'SUBTASK':
    case 'COMMENT':
      return [['tasks'], ['boards', event.boardId]]
    case 'MEMBER':
    case 'INVITATION':
      return [['boards', event.boardId], ['invitations']]
    default:
      return [['boards', event.boardId]]
  }
}
