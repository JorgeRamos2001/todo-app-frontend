import { useState } from 'react'

import { MoreHorizontalIcon } from 'lucide-react'
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
import { canEditBoard } from '@/features/boards/permissions'

const ROLE_LABELS = { OWNER: 'Owner', ADMIN: 'Admin', MEMBER: 'Member' } as const

export function BoardCard({ board }: { board: BoardSummary }) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const canEdit = canEditBoard(board.role)

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
          <div className="min-w-0 space-y-2">
            <CardTitle className="truncate text-base">{board.title}</CardTitle>
            <Badge variant={board.type === 'PERSONAL' ? 'secondary' : 'outline'}>
              {board.type === 'PERSONAL' ? 'Personal' : 'Collaborative'}
            </Badge>
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
        <CardContent>
          <p className="text-muted-foreground text-xs">{ROLE_LABELS[board.role]}</p>
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
