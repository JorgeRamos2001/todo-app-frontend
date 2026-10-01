import { useState } from 'react'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EllipsisIcon, PlusIcon } from 'lucide-react'

import type { BoardRole } from '@/api/boards'
import type { Column } from '@/api/columns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { DeleteColumnDialog } from '@/features/columns/components/delete-column-dialog'
import { useUpdateColumn } from '@/features/columns/hooks'
import { canCreateTask, canEditTask } from '@/features/boards/permissions'
import { TaskCard } from '@/features/tasks/components/task-card'
import { useCreateTask } from '@/features/tasks/hooks'
import { cn } from '@/lib/utils'

const COLUMN_DOTS = [
  'bg-muted-foreground/40',
  'bg-primary',
  'bg-[#3B82F6]',
  'bg-success',
  'bg-[#8B5CF6]',
]

interface BoardColumnProps {
  boardId: number
  column: Column
  index: number
  myRole: BoardRole
  myUserId: number | null
  onOpenTask: (taskId: number) => void
}

export function BoardColumn({
  boardId,
  column,
  index,
  myRole,
  myUserId,
  onOpenTask,
}: BoardColumnProps) {
  const canManage = myRole === 'OWNER' || myRole === 'ADMIN'
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `col:${column.id}`,
    data: { type: 'column', column },
    disabled: !canManage,
  })
  const { setNodeRef: setBodyRef, isOver } = useDroppable({
    id: `colbody:${column.id}`,
    data: { type: 'column-body', columnId: column.id },
  })

  const updateColumn = useUpdateColumn(boardId)
  const createTask = useCreateTask(boardId)

  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(column.name)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addingTask, setAddingTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const submitRename = () => {
    const nextName = name.trim()
    setRenaming(false)
    if (nextName === '' || nextName === column.name) {
      setName(column.name)
      return
    }
    updateColumn.mutate({ columnId: column.id, body: { name: nextName } })
  }

  const submitTask = () => {
    const title = taskTitle.trim()
    if (title === '') {
      return
    }
    createTask.mutate(
      { columnId: column.id, body: { title } },
      { onSuccess: () => setTaskTitle('') },
    )
  }

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-muted flex w-[272px] shrink-0 flex-col gap-2.5 rounded-2xl p-3',
        isDragging && 'opacity-50',
        isOver && 'ring-primary/40 ring-2',
      )}
    >
      <header
        ref={setActivatorNodeRef}
        {...attributes}
        {...(canManage ? listeners : {})}
        className={cn(
          'flex h-7 items-center gap-2.5 px-1',
          canManage && 'cursor-grab touch-none active:cursor-grabbing',
        )}
      >
        <span className={cn('size-2.5 rounded-full', COLUMN_DOTS[index % COLUMN_DOTS.length])} />
        {renaming ? (
          <Input
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            onBlur={submitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                submitRename()
              }
              if (event.key === 'Escape') {
                setName(column.name)
                setRenaming(false)
              }
            }}
            className="h-7 flex-1 rounded-lg px-2 text-sm font-semibold"
          />
        ) : (
          <h2 className="font-heading truncate text-sm font-semibold">{column.name}</h2>
        )}
        <span className="bg-card text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold">
          {column.tasks.length}
        </span>
        {canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Actions for ${column.name}`}
                className="text-muted-foreground hover:text-foreground ml-auto rounded-md p-0.5"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <EllipsisIcon className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setName(column.name)
                  setRenaming(true)
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <EllipsisIcon className="text-muted-foreground/50 ml-auto size-4" />
        )}
      </header>

      <div ref={setBodyRef} className="flex min-h-2 flex-col gap-2.5">
        <SortableContext
          items={column.tasks.map((task) => `task:${task.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              draggable={canEditTask(myRole, task, myUserId)}
              onOpen={onOpenTask}
            />
          ))}
        </SortableContext>
        {column.tasks.length === 0 ? (
          <p className="text-muted-foreground px-1 py-1 text-xs">No tasks yet</p>
        ) : null}
      </div>

      {canCreateTask(myRole) ? (
        addingTask ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submitTask()
            }}
            className="flex flex-col gap-2"
          >
            <Input
              value={taskTitle}
              autoFocus
              placeholder="Task title..."
              onChange={(event) => setTaskTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setAddingTask(false)
                  setTaskTitle('')
                }
              }}
              className="h-9 rounded-xl"
            />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={createTask.isPending}>
                {createTask.isPending ? 'Adding…' : 'Add task'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddingTask(false)
                  setTaskTitle('')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAddingTask(true)}
            className="text-muted-foreground hover:bg-card/70 hover:text-foreground flex h-9 items-center gap-2 rounded-xl px-2 text-sm font-semibold transition-colors"
          >
            <PlusIcon className="size-4" />
            Add task
          </button>
        )
      ) : null}

      <DeleteColumnDialog
        boardId={boardId}
        columnId={column.id}
        columnName={column.name}
        taskCount={column.tasks.length}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </section>
  )
}
