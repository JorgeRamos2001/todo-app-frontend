import type { BoardDetail } from '@/api/boards'
import type { Task } from '@/api/tasks'
import { moveTask, reorderColumns } from '@/features/boards/board-cache'

function task(id: number, columnId: number): Task {
  return {
    id,
    columnId,
    title: `Task ${id}`,
    description: null,
    position: 0,
    assigneeId: null,
    assigneeName: null,
    createdById: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

function board(): BoardDetail {
  return {
    id: 1,
    title: 'Board',
    description: null,
    type: 'COLLABORATIVE',
    ownerId: 1,
    members: [],
    columns: [
      { id: 10, name: 'Todo', position: 0, tasks: [task(1, 10), task(2, 10), task(3, 10)] },
      { id: 11, name: 'Doing', position: 1, tasks: [task(4, 11)] },
    ],
  }
}

const ids = (tasks: Task[]): number[] => tasks.map((candidate) => candidate.id)

describe('moveTask', () => {
  it('reorders within the same column', () => {
    const result = moveTask(board(), 1, 10, 2)

    expect(ids(result.columns[0]!.tasks)).toEqual([2, 3, 1])
  })

  it('moves a task across columns at the given index', () => {
    const result = moveTask(board(), 2, 11, 0)

    expect(ids(result.columns[0]!.tasks)).toEqual([1, 3])
    expect(ids(result.columns[1]!.tasks)).toEqual([2, 4])
  })

  it('appends when the index exceeds the target length', () => {
    const result = moveTask(board(), 1, 11, 99)

    expect(ids(result.columns[1]!.tasks)).toEqual([4, 1])
  })

  it('returns the same board when the task does not exist', () => {
    const original = board()

    expect(moveTask(original, 99, 11, 0)).toBe(original)
  })
})

describe('reorderColumns', () => {
  it('moves a column to a new index', () => {
    const result = reorderColumns(board(), 0, 1)

    expect(result.columns.map((column) => column.id)).toEqual([11, 10])
  })

  it('returns the same board for out-of-range indexes', () => {
    const original = board()

    expect(reorderColumns(original, 0, 0)).toBe(original)
    expect(reorderColumns(original, 5, 0)).toBe(original)
  })
})
