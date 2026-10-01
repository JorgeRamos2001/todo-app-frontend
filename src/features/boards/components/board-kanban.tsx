import { useState } from 'react'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { Columns3Icon, PlusIcon } from 'lucide-react'

import type { BoardDetail, BoardRole } from '@/api/boards'
import type { Column } from '@/api/columns'
import type { Task } from '@/api/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { moveTask, reorderColumns } from '@/features/boards/board-cache'
import { BoardColumn } from '@/features/columns/components/board-column'
import { useCreateColumn, useUpdateColumn } from '@/features/columns/hooks'
import { TaskCardPreview } from '@/features/tasks/components/task-card'
import { useUpdateTask } from '@/features/tasks/hooks'
import { queryKeys } from '@/lib/query-keys'

type DragData = { type: 'task'; task: Task; columnId: number } | { type: 'column'; column: Column }

interface BoardKanbanProps {
  board: BoardDetail
  myRole: BoardRole
  myUserId: number | null
  onOpenTask: (taskId: number) => void
}

export function BoardKanban({ board, myRole, myUserId, onOpenTask }: BoardKanbanProps) {
  const queryClient = useQueryClient()
  const updateTask = useUpdateTask(board.id)
  const updateColumn = useUpdateColumn(board.id)
  const createColumn = useCreateColumn(board.id)

  const canManageColumns = myRole === 'OWNER' || myRole === 'ADMIN'
  const [active, setActive] = useState<DragData | null>(null)
  const [addingColumn, setAddingColumn] = useState(false)
  const [columnName, setColumnName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const applyOptimistic = (next: BoardDetail) => {
    queryClient.setQueryData(queryKeys.board(board.id), next)
  }

  const resolveColumn = (overId: string): Column | undefined => {
    if (overId.startsWith('colbody:')) {
      const id = Number(overId.slice('colbody:'.length))
      return board.columns.find((column) => column.id === id)
    }
    if (overId.startsWith('col:')) {
      const id = Number(overId.slice('col:'.length))
      return board.columns.find((column) => column.id === id)
    }
    if (overId.startsWith('task:')) {
      const taskId = Number(overId.slice('task:'.length))
      return board.columns.find((column) => column.tasks.some((task) => task.id === taskId))
    }
    return undefined
  }

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined
    setActive(data ?? null)
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActive(null)
    const data = event.active.data.current as DragData | undefined
    const overId = event.over === null ? null : String(event.over.id)
    if (data === undefined || overId === null) {
      return
    }

    if (data.type === 'column') {
      const target = resolveColumn(overId)
      if (target === undefined) {
        return
      }
      const fromIndex = board.columns.findIndex((column) => column.id === data.column.id)
      const toIndex = board.columns.findIndex((column) => column.id === target.id)
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return
      }
      applyOptimistic(reorderColumns(board, fromIndex, toIndex))
      updateColumn.mutate({ columnId: data.column.id, body: { position: toIndex } })
      return
    }

    const task = data.task
    const sourceColumn = board.columns.find((column) => column.id === data.columnId)
    if (sourceColumn === undefined) {
      return
    }
    const byTask = overId.startsWith('task:')
    const overTaskId = byTask ? Number(overId.slice('task:'.length)) : null
    const targetColumn = byTask
      ? board.columns.find((column) =>
          column.tasks.some((candidate) => candidate.id === overTaskId),
        )
      : resolveColumn(overId)
    if (targetColumn === undefined) {
      return
    }

    if (targetColumn.id === sourceColumn.id) {
      const fromIndex = sourceColumn.tasks.findIndex((candidate) => candidate.id === task.id)
      const toIndex = byTask
        ? sourceColumn.tasks.findIndex((candidate) => candidate.id === overTaskId)
        : sourceColumn.tasks.length - 1
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return
      }
      const columns = board.columns.map((column) =>
        column.id === sourceColumn.id
          ? { ...column, tasks: arrayMove(column.tasks, fromIndex, toIndex) }
          : column,
      )
      applyOptimistic({ ...board, columns })
      updateTask.mutate({ taskId: task.id, body: { columnId: targetColumn.id, position: toIndex } })
      return
    }

    const without = targetColumn.tasks.filter((candidate) => candidate.id !== task.id)
    const toIndex = byTask
      ? Math.max(
          0,
          without.findIndex((candidate) => candidate.id === overTaskId),
        )
      : without.length
    applyOptimistic(moveTask(board, task.id, targetColumn.id, toIndex))
    updateTask.mutate({ taskId: task.id, body: { columnId: targetColumn.id, position: toIndex } })
  }

  const submitColumn = () => {
    const name = columnName.trim()
    if (name === '') {
      return
    }
    createColumn.mutate(name, {
      onSuccess: () => {
        setColumnName('')
        setAddingColumn(false)
      },
    })
  }

  const addColumnControl = canManageColumns ? (
    addingColumn ? (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submitColumn()
        }}
        className="border-border-strong flex w-[272px] shrink-0 flex-col gap-2 rounded-2xl border border-dashed p-3"
      >
        <Input
          value={columnName}
          autoFocus
          placeholder="Column name..."
          onChange={(event) => setColumnName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setAddingColumn(false)
              setColumnName('')
            }
          }}
          className="h-9 rounded-xl"
        />
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={createColumn.isPending}>
            {createColumn.isPending ? 'Adding…' : 'Add column'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAddingColumn(false)
              setColumnName('')
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    ) : (
      <button
        type="button"
        onClick={() => setAddingColumn(true)}
        className="border-border-strong text-muted-foreground hover:border-primary/50 hover:text-foreground flex h-[118px] w-[240px] shrink-0 flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed text-sm font-semibold transition-colors"
      >
        <span className="bg-card flex size-9 items-center justify-center rounded-xl border">
          <PlusIcon className="size-4" />
        </span>
        Add column
      </button>
    )
  ) : null

  if (board.columns.length === 0) {
    return (
      <div className="flex items-start gap-4">
        {canManageColumns ? null : (
          <div className="bg-card/50 mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
            <Columns3Icon className="text-muted-foreground size-8" aria-hidden="true" />
            <p className="font-medium">This board has no columns yet</p>
            <p className="text-muted-foreground text-sm">
              The owner or an admin can add the first column.
            </p>
          </div>
        )}
        {addColumnControl}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="flex items-start gap-4">
        <SortableContext
          items={board.columns.map((column) => `col:${column.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {board.columns.map((column, index) => (
            <BoardColumn
              key={column.id}
              boardId={board.id}
              column={column}
              index={index}
              myRole={myRole}
              myUserId={myUserId}
              onOpenTask={onOpenTask}
            />
          ))}
        </SortableContext>
        {addColumnControl}
      </div>
      <DragOverlay>
        {active === null ? null : active.type === 'task' ? (
          <div className="w-[272px]">
            <TaskCardPreview task={active.task} dragging />
          </div>
        ) : (
          <section className="bg-muted flex w-[272px] flex-col gap-2.5 rounded-2xl p-3 opacity-90 shadow-xl">
            <header className="flex h-7 items-center gap-2.5 px-1">
              <span className="bg-primary size-2.5 rounded-full" />
              <h2 className="font-heading text-sm font-semibold">{active.column.name}</h2>
              <span className="bg-card text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold">
                {active.column.tasks.length}
              </span>
            </header>
          </section>
        )}
      </DragOverlay>
    </DndContext>
  )
}
