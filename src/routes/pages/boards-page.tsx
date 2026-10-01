import { useState } from 'react'

import { LayoutGridIcon, MailIcon, PlusIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import { useAuth } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'
import { BoardCard } from '@/features/boards/components/board-card'
import { BoardFormDialog } from '@/features/boards/components/board-form-dialog'
import { useBoards } from '@/features/boards/hooks'
import { useReceivedInvitations } from '@/features/invitations/hooks'
import { openInvitationCount } from '@/features/invitations/utils'
import { getErrorMessage } from '@/lib/errors'
import { firstNameOf, getGreeting } from '@/lib/format'

function BoardsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Skeleton key={index} className="h-40 w-full rounded-2xl" />
      ))}
    </div>
  )
}

export function BoardsPage() {
  const { user } = useAuth()
  const boardsQuery = useBoards()
  const invitationsQuery = useReceivedInvitations()
  const [searchParams, setSearchParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  const query = (searchParams.get('q') ?? '').trim().toLowerCase()
  const openNew = searchParams.get('new') === '1'
  const pendingInvitations = openInvitationCount(invitationsQuery.data ?? [])
  const boards = boardsQuery.data ?? []
  const visibleBoards =
    query === '' ? boards : boards.filter((board) => board.title.toLowerCase().includes(query))
  const greeting = getGreeting()
  const firstName = user === null ? '' : firstNameOf(user.name)

  const closeCreate = () => {
    setCreateOpen(false)
    if (openNew) {
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {greeting}
            {firstName === '' ? '' : `, ${firstName}`}
          </h1>
          <p className="text-muted-foreground text-sm">
            You have {boards.length} {boards.length === 1 ? 'board' : 'boards'}. Pick one or start
            something new.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          New board
        </Button>
      </div>

      {pendingInvitations > 0 ? (
        <Link
          to="/invitations"
          className="border-primary/20 bg-accent-soft text-accent-text hover:border-primary/40 mb-6 flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-colors"
        >
          <MailIcon className="size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {pendingInvitations} {pendingInvitations === 1 ? 'invitation' : 'invitations'} waiting
            </p>
            <p className="truncate text-[13px]">
              Someone wants you to join their board. Review and respond.
            </p>
          </div>
          <span className="border-primary/30 bg-card rounded-xl border px-3.5 py-2 text-[13px] font-bold">
            Review
          </span>
        </Link>
      ) : null}

      {boardsQuery.isPending ? (
        <BoardsSkeleton />
      ) : boardsQuery.isError ? (
        <ErrorState
          title="Could not load your boards"
          description={getErrorMessage(boardsQuery.error)}
          action={<Button onClick={() => void boardsQuery.refetch()}>Retry</Button>}
        />
      ) : visibleBoards.length === 0 && query !== '' ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
          <p className="font-medium">No boards match “{searchParams.get('q')}”</p>
          <p className="text-muted-foreground text-sm">Try a different name or clear the search.</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleBoards.map((board) => (
            <BoardCard key={board.id} board={board} index={boards.indexOf(board)} />
          ))}
        </div>
      )}

      <BoardFormDialog
        open={createOpen || openNew}
        onOpenChange={(open) => !open && closeCreate()}
      />
    </main>
  )
}
