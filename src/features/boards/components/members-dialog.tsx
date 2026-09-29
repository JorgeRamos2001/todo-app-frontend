import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { UserMinusIcon } from 'lucide-react'

import { fetchBoardMembers, type BoardDetail, type BoardMember, type BoardRole } from '@/api/boards'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useRemoveBoardMember } from '@/features/boards/hooks'
import { canRemoveMember } from '@/features/boards/permissions'
import { initialsOf } from '@/lib/initials'
import { queryKeys } from '@/lib/query-keys'

interface MembersDialogProps {
  board: BoardDetail
  myRole: BoardRole
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MembersDialog({ board, myRole, open, onOpenChange }: MembersDialogProps) {
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(null)
  const membersQuery = useQuery({
    queryKey: queryKeys.boardMembers(board.id),
    queryFn: () => fetchBoardMembers(board.id),
    enabled: open,
  })
  const removeMutation = useRemoveBoardMember(board.id)
  const members = membersQuery.data ?? board.members

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Members</DialogTitle>
            <DialogDescription>People with access to “{board.title}”.</DialogDescription>
          </DialogHeader>
          {membersQuery.isPending && membersQuery.data === undefined ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-lg border p-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{initialsOf(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{member.email}</p>
                  </div>
                  <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                  {canRemoveMember(myRole, member.role) ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${member.name}`}
                      onClick={() => setMemberToRemove(member)}
                    >
                      <UserMinusIcon />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={memberToRemove !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setMemberToRemove(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {memberToRemove?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to this board immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={removeMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                if (memberToRemove === null) {
                  return
                }
                removeMutation.mutate(memberToRemove.id, {
                  onSuccess: () => setMemberToRemove(null),
                })
              }}
            >
              {removeMutation.isPending ? 'Removing…' : 'Remove member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
