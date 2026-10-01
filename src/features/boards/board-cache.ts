import type { BoardDetail } from '@/api/boards'

export function moveTask(
  board: BoardDetail,
  taskId: number,
  toColumnId: number,
  toIndex: number,
): BoardDetail {
  const source = board.columns.find((column) => column.tasks.some((task) => task.id === taskId))
  if (source === undefined) {
    return board
  }
  const task = source.tasks.find((candidate) => candidate.id === taskId)
  if (task === undefined) {
    return board
  }

  const columns = board.columns.map((column) => {
    if (column.id === source.id && column.id === toColumnId) {
      const without = column.tasks.filter((candidate) => candidate.id !== taskId)
      const index = Math.max(0, Math.min(toIndex, without.length))
      return {
        ...column,
        tasks: [...without.slice(0, index), task, ...without.slice(index)],
      }
    }
    if (column.id === source.id) {
      return { ...column, tasks: column.tasks.filter((candidate) => candidate.id !== taskId) }
    }
    if (column.id === toColumnId) {
      const index = Math.max(0, Math.min(toIndex, column.tasks.length))
      return {
        ...column,
        tasks: [...column.tasks.slice(0, index), task, ...column.tasks.slice(index)],
      }
    }
    return column
  })

  return { ...board, columns }
}

export function reorderColumns(
  board: BoardDetail,
  fromIndex: number,
  toIndex: number,
): BoardDetail {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= board.columns.length ||
    toIndex >= board.columns.length
  ) {
    return board
  }
  const columns = [...board.columns]
  const [moved] = columns.splice(fromIndex, 1)
  if (moved === undefined) {
    return board
  }
  columns.splice(toIndex, 0, moved)
  return { ...board, columns }
}
