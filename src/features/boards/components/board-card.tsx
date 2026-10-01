import { useState } from 'react'

import { MoreHorizontalIcon, UsersIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

import type { BoardSummary } from '@/api/boards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BoardFormDialog } from '@/features/boards/components/board-form-dialog'
import { DeleteBoardDialog } from '@/features/boards/components/delete-board-dialog'
import { boardVisual } from '@/features/boards/board-visuals'
import { canEditBoard } from '@/features/boards/permissions'

const ROLE_LABELS = { OWNER: 'Owner', ADMIN: 'Admin', MEMBER: 'Member' } as const

export function BoardCard({ board, index }: { board: BoardSummary; index: number }) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const canEdit = canEditBoard(board.role)
  const visual = boardVisual(index)
  const TileIcon = visual.icon
  const isCollaborative = board.type === 'COLLABORATIVE'

  const openBoard = () => {
    void navigate(`/boards/${board.id}`)
  }

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        aria-label={`Open board ${board.title}`}
        onClick={openBoard}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openBoard()
          }
        }}
        className="cursor-pointer transition-shadow hover:shadow-md"
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${visual.tile}`}
          >
            <TileIcon className="size-5" />
          </div>
          {canEdit ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${board.title}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          <CardTitle className="font-heading truncate text-[17px] font-semibold">
            {board.title}
          </CardTitle>
          <div className="flex items-center justify-between gap-2">
            {isCollaborative ? (
              <Badge className="bg-accent-soft text-accent-text ring-primary/20 ring-1">
                <UsersIcon />
                Collaborative
              </Badge>
            ) : (
              <Badge variant="secondary">Personal</Badge>
            )}
            <span className="text-muted-foreground text-xs font-medium">
              {ROLE_LABELS[board.role]}
            </span>
          </div>
        </CardContent>
      </Card>
      <BoardFormDialog open={editOpen} onOpenChange={setEditOpen} boardId={board.id} />
      <DeleteBoardDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        boardId={board.id}
        boardTitle={board.title}
      />
    </>
  )
}
