import type { RealtimeStatus } from '@/realtime/client'
import { cn } from '@/lib/utils'

const CONFIG: Record<RealtimeStatus, { label: string; pill: string; dot: string }> = {
  live: {
    label: 'Live',
    pill: 'bg-success-soft text-success ring-success/20',
    dot: 'bg-success animate-pulse',
  },
  connecting: {
    label: 'Connecting…',
    pill: 'bg-[#FEF3C7] text-[#B45309] ring-[#F59E0B]/20 dark:bg-[#332A12] dark:text-[#FCD34D]',
    dot: 'bg-[#F59E0B] animate-pulse',
  },
  reconnecting: {
    label: 'Reconnecting…',
    pill: 'bg-[#FEF3C7] text-[#B45309] ring-[#F59E0B]/20 dark:bg-[#332A12] dark:text-[#FCD34D]',
    dot: 'bg-[#F59E0B] animate-pulse',
  },
  offline: {
    label: 'Offline',
    pill: 'bg-muted text-muted-foreground ring-border',
    dot: 'bg-muted-foreground/60',
  },
}

export function BoardLiveIndicator({ status }: { status: RealtimeStatus }) {
  const config = CONFIG[status]

  return (
    <span
      className={cn(
        'flex h-[30px] items-center gap-1.5 rounded-full px-3 text-xs font-bold ring-1',
        config.pill,
      )}
    >
      <span className={cn('size-[7px] rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
