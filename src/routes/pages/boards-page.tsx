import { useState } from 'react'

import { LayoutGridIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'
import { BoardCard } from '@/features/boards/components/board-card'
import { BoardFormDialog } from '@/features/boards/components/board-form-dialog'
import { useBoards } from '@/features/boards/hooks'
import { getErrorMessage } from '@/lib/errors'

function BoardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function BoardsPage() {
  const boardsQuery = useBoards()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Your boards</h1>
          <p className="text-muted-foreground text-sm">
            Pick a board or create a new one to start organizing work.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          New board
        </Button>
      </div>

      {boardsQuery.isPending ? (
        <BoardsSkeleton />
      ) : boardsQuery.isError ? (
        <ErrorState
          title="Could not load your boards"
          description={getErrorMessage(boardsQuery.error)}
          action={<Button onClick={() => void boardsQuery.refetch()}>Retry</Button>}
        />
      ) : boardsQuery.data.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <LayoutGridIcon className="text-muted-foreground size-8" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">No boards yet</p>
            <p className="text-muted-foreground text-sm">
              Create your first board to start adding columns and tasks.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New board
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boardsQuery.data.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}

      <BoardFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </main>
  )
}
