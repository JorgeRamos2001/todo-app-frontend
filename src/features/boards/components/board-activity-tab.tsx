import { HistoryIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'
import { describeActivity } from '@/features/boards/activity-format'
import { useBoardActivities } from '@/features/boards/hooks'
import { getErrorMessage } from '@/lib/errors'
import { formatRelativeTime } from '@/lib/format'
import { initialsOf } from '@/lib/initials'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-[#FFEAD9] text-[#C2410C] dark:bg-[#3A2618] dark:text-[#FDBA74]',
  'bg-[#EDE7FE] text-[#6D28D9] dark:bg-[#2A2140] dark:text-[#C4B5FD]',
  'bg-[#E3EEFE] text-[#1D4ED8] dark:bg-[#1E2A44] dark:text-[#93C5FD]',
  'bg-[#DFF4EF] text-[#0F766E] dark:bg-[#14322C] dark:text-[#5EEAD4]',
]

export function BoardActivityTab({ boardId }: { boardId: number }) {
  const activitiesQuery = useBoardActivities(boardId, true)
  const activities = activitiesQuery.data?.pages.flatMap((page) => page.content) ?? []

  if (activitiesQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-3">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    )
  }

  if (activitiesQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <ErrorState
          title="Could not load the activity log"
          description={getErrorMessage(activitiesQuery.error)}
          action={<Button onClick={() => void activitiesQuery.refetch()}>Retry</Button>}
        />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
        <HistoryIcon className="text-muted-foreground size-8" aria-hidden="true" />
        <p className="font-medium">No activity yet</p>
        <p className="text-muted-foreground text-sm">
          Actions on this board will show up here as they happen.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-base font-semibold">Activity</h2>
            <p className="text-muted-foreground text-[13px]">
              Everything that happened on this board.
            </p>
          </div>
          {activitiesQuery.hasNextPage ? (
            <Button
              variant="outline"
              size="sm"
              disabled={activitiesQuery.isFetchingNextPage}
              onClick={() => void activitiesQuery.fetchNextPage()}
            >
              {activitiesQuery.isFetchingNextPage ? 'Loading…' : 'Load older'}
            </Button>
          ) : null}
        </div>
        <ul>
          {activities.map((activity, index) => (
            <li
              key={activity.id}
              className={cn(
                'flex items-center gap-3.5 px-5 py-3.5',
                index < activities.length - 1 && 'border-b',
              )}
            >
              <Avatar className="size-8">
                <AvatarFallback
                  className={cn('text-[11px] font-bold', AVATAR_COLORS[activity.actorId % 4])}
                >
                  {initialsOf(activity.actorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px]">
                  <span className="font-bold">{activity.actorName}</span>{' '}
                  <span className="text-muted-foreground">
                    {describeActivity(activity.action, activity.details)}
                  </span>
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatRelativeTime(activity.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
