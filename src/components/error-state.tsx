import type { ReactNode } from 'react'
import { AlertCircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center',
        className,
      )}
    >
      <AlertCircleIcon className="text-muted-foreground size-8" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description === undefined ? null : (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
