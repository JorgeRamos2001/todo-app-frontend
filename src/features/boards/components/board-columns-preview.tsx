import { Columns3Icon, EllipsisIcon, PencilIcon } from 'lucide-react'

import type { Column } from '@/api/columns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/format'
import { initialsOf } from '@/lib/initials'
import { cn } from '@/lib/utils'

const COLUMN_DOTS = [
  'bg-muted-foreground/40',
  'bg-primary',
  'bg-[#3B82F6]',
  'bg-success',
  'bg-[#8B5CF6]',
]

const AVATAR_COLORS = [
  'bg-[#FFEAD9] text-[#C2410C] dark:bg-[#3A2618] dark:text-[#FDBA74]',
  'bg-[#EDE7FE] text-[#6D28D9] dark:bg-[#2A2140] dark:text-[#C4B5FD]',
  'bg-[#E3EEFE] text-[#1D4ED8] dark:bg-[#1E2A44] dark:text-[#93C5FD]',
  'bg-[#DFF4EF] text-[#0F766E] dark:bg-[#14322C] dark:text-[#5EEAD4]',
]

export function BoardColumnsPreview({ columns }: { columns: Column[] }) {
  if (columns.length === 0) {
    return (
      <div className="bg-card/50 mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
        <Columns3Icon className="text-muted-foreground size-8" aria-hidden="true" />
        <p className="font-medium">This board has no columns yet</p>
        <p className="text-muted-foreground text-sm">
          Creating and reordering columns arrives in the next phase.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4">
      {columns.map((column, columnIndex) => (
        <section
          key={column.id}
          className="bg-muted flex w-[272px] shrink-0 flex-col gap-2.5 rounded-2xl p-3"
        >
          <header className="flex h-7 items-center gap-2.5 px-1">
            <span
              className={cn('size-2.5 rounded-full', COLUMN_DOTS[columnIndex % COLUMN_DOTS.length])}
            />
            <h2 className="font-heading truncate text-sm font-semibold">{column.name}</h2>
            <span className="bg-card text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold">
              {column.tasks.length}
            </span>
            <EllipsisIcon className="text-muted-foreground ml-auto size-4" />
          </header>
          {column.tasks.length === 0 ? (
            <p className="text-muted-foreground px-1 py-2 text-xs">No tasks yet</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {column.tasks.map((task) => (
                <article
                  key={task.id}
                  className="bg-card rounded-2xl border p-3.5 shadow-sm transition-shadow hover:shadow-md"
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
                            AVATAR_COLORS[(task.assigneeId ?? 0) % AVATAR_COLORS.length],
                          )}
                        >
                          {initialsOf(task.assigneeName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
