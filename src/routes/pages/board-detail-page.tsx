import { useState } from 'react'

import {
  EllipsisIcon,
  HistoryIcon,
  PencilIcon,
  PlusIcon,
  SquareKanbanIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'

import { ApiError } from '@/api/client'
import type { BoardMember } from '@/api/boards'
import { useAuth } from '@/auth/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'
import { BoardActivityTab } from '@/features/boards/components/board-activity-tab'
import { BoardColumnsPreview } from '@/features/boards/components/board-columns-preview'
import { BoardFormDialog } from '@/features/boards/components/board-form-dialog'
import { BoardMembersTab } from '@/features/boards/components/board-members-tab'
import { DeleteBoardDialog } from '@/features/boards/components/delete-board-dialog'
import { InviteDialog } from '@/features/boards/components/invite-dialog'
import { useBoard } from '@/features/boards/hooks'
import { canEditBoard, canManageMembers } from '@/features/boards/permissions'
import { getErrorMessage } from '@/lib/errors'
import { initialsOf } from '@/lib/initials'
import { cn } from '@/lib/utils'

type BoardTab = 'kanban' | 'members' | 'activity'

const AVATAR_COLORS = [
  'bg-[#FFEAD9] text-[#C2410C] dark:bg-[#3A2618] dark:text-[#FDBA74]',
  'bg-[#EDE7FE] text-[#6D28D9] dark:bg-[#2A2140] dark:text-[#C4B5FD]',
  'bg-[#E3EEFE] text-[#1D4ED8] dark:bg-[#1E2A44] dark:text-[#93C5FD]',
  'bg-[#DFF4EF] text-[#0F766E] dark:bg-[#14322C] dark:text-[#5EEAD4]',
]

function BoardSkeleton() {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-64 w-[272px] shrink-0 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function MemberAvatars({ members }: { members: BoardMember[] }) {
  const visible = members.slice(0, 3)
  return (
    <div className="hidden items-center sm:flex">
      {visible.map((member, index) => (
        <Avatar
          key={member.id}
          className={cn('border-background size-8 border-2', index > 0 && '-ml-2')}
        >
          <AvatarFallback className={cn('text-[11px] font-bold', AVATAR_COLORS[index % 4])}>
            {initialsOf(member.name)}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}

export function BoardDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const parsedBoardId = Number(params.boardId)
  const boardId = Number.isInteger(parsedBoardId) && parsedBoardId > 0 ? parsedBoardId : null
  const boardQuery = useBoard(boardId)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const tabParam = searchParams.get('tab')
  const tab: BoardTab =
    tabParam === 'members' || tabParam === 'activity' ? tabParam : ('kanban' as const)

  const setTab = (next: BoardTab) => {
    const nextParams = new URLSearchParams(searchParams)
    if (next === 'kanban') {
      nextParams.delete('tab')
    } else {
      nextParams.set('tab', next)
    }
    setSearchParams(nextParams, { replace: true })
  }

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
        <div className="border-b px-4 py-4 sm:px-6">
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
  const canInvite = canManageMembers(myRole) && board.type === 'COLLABORATIVE'

  const tabs: { id: BoardTab; label: string; icon: typeof SquareKanbanIcon }[] = [
    { id: 'kanban', label: 'Kanban', icon: SquareKanbanIcon },
    { id: 'members', label: 'Members', icon: UsersIcon },
    ...(canEdit ? [{ id: 'activity' as const, label: 'Activity', icon: HistoryIcon }] : []),
  ]

  return (
    <main className="flex flex-1 flex-col">
      <div className="bg-background border-b">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 pt-4 pb-2 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading truncate text-[22px] font-semibold">{board.title}</h1>
              {board.type === 'COLLABORATIVE' ? (
                <Badge className="bg-accent-soft text-accent-text ring-primary/20 ring-1">
                  <UsersIcon />
                  Collaborative
                </Badge>
              ) : (
                <Badge variant="secondary">Personal</Badge>
              )}
            </div>
            {board.description === null || board.description === '' ? null : (
              <p className="text-muted-foreground mt-0.5 max-w-2xl truncate text-[13.5px]">
                {board.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MemberAvatars members={board.members} />
            {canInvite ? (
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <PlusIcon />
                Invite
              </Button>
            ) : null}
            {canEdit ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="size-9 rounded-xl"
                    aria-label="Board actions"
                  >
                    <EllipsisIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                    <PencilIcon />
                    Edit board
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                    <Trash2Icon />
                    Delete board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 sm:px-6">
          {tabs.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'relative flex h-11 items-center gap-2 text-sm font-semibold transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className={cn('size-4', active && 'text-accent-text')} />
                {item.label}
                {item.id === 'members' ? (
                  <span className="bg-muted text-muted-foreground rounded-full px-1.5 text-[11px] font-bold">
                    {board.members.length}
                  </span>
                ) : null}
                {active ? (
                  <span className="bg-primary absolute inset-x-0 -bottom-px h-0.5 rounded-full" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {tab === 'kanban' ? (
        <div className="flex-1 overflow-x-auto p-5 sm:p-6">
          <BoardColumnsPreview columns={board.columns} />
        </div>
      ) : (
        <div className="flex-1 p-5 sm:p-6">
          {tab === 'members' ? (
            <BoardMembersTab board={board} myRole={myRole} onInvite={() => setInviteOpen(true)} />
          ) : (
            <BoardActivityTab boardId={board.id} />
          )}
        </div>
      )}

      <InviteDialog
        boardId={board.id}
        boardTitle={board.title}
        myRole={myRole}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
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
