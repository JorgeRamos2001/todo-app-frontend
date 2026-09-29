import { Columns3Icon } from 'lucide-react'

import type { Column } from '@/api/columns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { initialsOf } from '@/lib/initials'

export function BoardColumnsPreview({ columns }: { columns: Column[] }) {
  if (columns.length === 0) {
    return (
      <div className="bg-background/50 mx-auto flex max-w-md flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
        <Columns3Icon className="text-muted-foreground size-8" aria-hidden="true" />
        <p className="font-medium">This board has no columns yet</p>
        <p className="text-muted-foreground text-sm">
          Creating and reordering columns arrives in the next phase.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      {columns.map((column) => (
        <section
          key={column.id}
          className="bg-muted flex w-72 shrink-0 flex-col gap-2 rounded-xl p-3"
        >
          <header className="flex items-center justify-between px-1">
            <h2 className="text-sm font-medium">{column.name}</h2>
            <span className="text-muted-foreground text-xs">{column.tasks.length}</span>
          </header>
          {column.tasks.length === 0 ? (
            <p className="text-muted-foreground px-1 py-2 text-xs">No tasks yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {column.tasks.map((task) => (
                <article key={task.id} className="bg-card rounded-lg border p-3 shadow-sm">
                  <p className="text-sm">{task.title}</p>
                  {task.assigneeName === null ? null : (
                    <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[10px]">
                          {initialsOf(task.assigneeName)}
                        </AvatarFallback>
                      </Avatar>
                      {task.assigneeName}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
