import { useState } from 'react'

import { PencilIcon, Trash2Icon, UsersIcon } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/use-auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'
import { BoardColumnsPreview } from '@/features/boards/components/board-columns-preview'
import { DeleteBoardDialog } from '@/features/boards/components/delete-board-dialog'
import { BoardFormDialog } from '@/features/boards/components/board-form-dialog'
import { MembersDialog } from '@/features/boards/components/members-dialog'
import { useBoard } from '@/features/boards/hooks'
import { canEditBoard } from '@/features/boards/permissions'
import { getErrorMessage } from '@/lib/errors'

function BoardSkeleton() {
  return (
    <div className="bg-muted/40 flex-1 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-64 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function BoardDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const parsedBoardId = Number(params.boardId)
  const boardId = Number.isInteger(parsedBoardId) && parsedBoardId > 0 ? parsedBoardId : null
  const boardQuery = useBoard(boardId)

  const [membersOpen, setMembersOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (boardId === null) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <ErrorState
          title="Board not found"
          description="The board link is not valid."
          action={
            <Button asChild>
              <Link to="/">Back to boards</Link>
            </Button>
          }
        />
      </main>
    )
  }

  if (boardQuery.isPending) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3 sm:px-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <BoardSkeleton />
      </main>
    )
  }

  if (boardQuery.isError) {
    const isForbidden = boardQuery.error instanceof ApiError && boardQuery.error.status === 403
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <ErrorState
          title={isForbidden ? 'You are not a member of this board' : 'Could not load the board'}
          description={
            isForbidden
              ? 'Ask the owner for an invitation or go back to your boards.'
              : getErrorMessage(boardQuery.error)
          }
          action={
            <Button asChild>
              <Link to="/">Back to boards</Link>
            </Button>
          }
        />
      </main>
    )
  }

  const board = boardQuery.data
  const myRole = board.members.find((member) => member.userId === user?.id)?.role ?? 'MEMBER'
  const canEdit = canEditBoard(myRole)

  return (
    <main className="flex flex-1 flex-col">
      <div className="bg-background border-b">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading truncate text-xl font-semibold">{board.title}</h1>
              <Badge variant={board.type === 'PERSONAL' ? 'secondary' : 'outline'}>
                {board.type === 'PERSONAL' ? 'Personal' : 'Collaborative'}
              </Badge>
            </div>
            {board.description === null || board.description === '' ? null : (
              <p className="text-muted-foreground max-w-2xl truncate text-sm">
                {board.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {board.type === 'PERSONAL' ? null : (
              <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)}>
                <UsersIcon />
                Members ({board.members.length})
              </Button>
            )}
            {canEdit ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  <PencilIcon />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2Icon />
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-muted/40 flex-1 overflow-x-auto p-4 sm:p-6">
        <BoardColumnsPreview columns={board.columns} />
      </div>

      <MembersDialog
        board={board}
        myRole={myRole}
        open={membersOpen}
        onOpenChange={setMembersOpen}
      />
      <BoardFormDialog open={editOpen} onOpenChange={setEditOpen} boardId={board.id} />
      <DeleteBoardDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        boardId={board.id}
        boardTitle={board.title}
        onDeleted={() => void navigate('/', { replace: true })}
      />
    </main>
  )
}
