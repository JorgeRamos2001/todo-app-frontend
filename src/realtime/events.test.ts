import { invalidationKeys, type RealtimeEvent } from '@/realtime/events'

function event(overrides: Partial<RealtimeEvent>): RealtimeEvent {
  return {
    type: 'TASK_MOVED',
    boardId: 4,
    entityType: 'TASK',
    entityId: 1,
    actorId: 2,
    payload: {},
    occurredAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('invalidationKeys', () => {
  it('invalidates the board for board, column and task events', () => {
    expect(invalidationKeys(event({ entityType: 'BOARD' }))).toEqual([['boards', 4]])
    expect(invalidationKeys(event({ entityType: 'COLUMN' }))).toEqual([['boards', 4]])
    expect(invalidationKeys(event({ entityType: 'TASK' }))).toEqual([['boards', 4]])
  })

  it('invalidates all task-scoped queries for subtask and comment events', () => {
    expect(invalidationKeys(event({ entityType: 'SUBTASK' }))).toEqual([['tasks'], ['boards', 4]])
    expect(invalidationKeys(event({ entityType: 'COMMENT' }))).toEqual([['tasks'], ['boards', 4]])
  })

  it('invalidates invitations for member and invitation events', () => {
    expect(invalidationKeys(event({ entityType: 'MEMBER' }))).toEqual([
      ['boards', 4],
      ['invitations'],
    ])
    expect(invalidationKeys(event({ entityType: 'INVITATION' }))).toEqual([
      ['boards', 4],
      ['invitations'],
    ])
  })
})
