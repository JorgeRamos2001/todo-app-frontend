import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PencilIcon } from 'lucide-react'

import type { Task } from '@/api/tasks'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TASK_AVATAR_COLORS } from '@/lib/avatar-colors'
import { formatRelativeTime } from '@/lib/format'
import { initialsOf } from '@/lib/initials'
import { cn } from '@/lib/utils'

export function TaskCardPreview({ task, dragging = false }: { task: Task; dragging?: boolean }) {
  return (
    <article
      className={cn(
        'bg-card rounded-2xl border p-3.5 shadow-sm transition-shadow hover:shadow-md',
        dragging && 'rotate-2 shadow-lg',
      )}
    >
      <p className="text-sm leading-snug font-bold">{task.title}</p>
      {task.description === null || task.description === '' ? null : (
        <p className="text-muted-foreground mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed">
          {task.description}
        </p>
      )}
      <div className="text-muted-foreground mt-3 flex items-center gap-1.5 text-[11.5px]">
        <PencilIcon className="size-3" />
        <span>Edited {formatRelativeTime(task.updatedAt)}</span>
        {task.assigneeName === null ? null : (
          <Avatar className="ml-auto size-6">
            <AvatarFallback
              className={cn(
                'text-[9px] font-bold',
                TASK_AVATAR_COLORS[(task.assigneeId ?? 0) % TASK_AVATAR_COLORS.length],
              )}
            >
              {initialsOf(task.assigneeName)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </article>
  )
}

interface TaskCardProps {
  task: Task
  draggable: boolean
  onOpen: (taskId: number) => void
}

export function TaskCard({ task, draggable, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task:${task.id}`,
    data: { type: 'task', task, columnId: task.columnId },
    disabled: !draggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(draggable ? listeners : {})}
      onClick={() => onOpen(task.id)}
      className={cn(
        'focus-visible:ring-ring/60 rounded-2xl outline-none focus-visible:ring-2',
        draggable && 'cursor-grab touch-none active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <TaskCardPreview task={task} />
    </div>
  )
}
