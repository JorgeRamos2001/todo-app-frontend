import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { UserMinusIcon, UserPlusIcon } from 'lucide-react'

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
import { Skeleton } from '@/components/ui/skeleton'
import { useRemoveBoardMember } from '@/features/boards/hooks'
import { canRemoveMember } from '@/features/boards/permissions'
import { initialsOf } from '@/lib/initials'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

interface BoardMembersTabProps {
  board: BoardDetail
  myRole: BoardRole
  onInvite: () => void
}

const roleBadgeClass: Record<BoardRole, string> = {
  OWNER: 'bg-foreground text-background',
  ADMIN: 'bg-[#EDE7FE] text-[#6D28D9] dark:bg-[#2A2140] dark:text-[#C4B5FD]',
  MEMBER: 'bg-secondary text-secondary-foreground',
}

export function BoardMembersTab({ board, myRole, onInvite }: BoardMembersTabProps) {
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(null)
  const membersQuery = useQuery({
    queryKey: queryKeys.boardMembers(board.id),
    queryFn: () => fetchBoardMembers(board.id),
  })
  const removeMutation = useRemoveBoardMember(board.id)
  const members = membersQuery.data ?? board.members

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="bg-card w-full max-w-3xl overflow-hidden rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-base font-semibold">Board members</h2>
            <p className="text-muted-foreground text-[13px]">
              {members.length} {members.length === 1 ? 'person has' : 'people have'} access to this
              board.
            </p>
          </div>
          <Button size="sm" onClick={onInvite}>
            <UserPlusIcon />
            Invite people
          </Button>
        </div>
        {membersQuery.isPending && membersQuery.data === undefined ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ul>
            {members.map((member, index) => (
              <li
                key={member.id}
                className={cn(
                  'flex items-center gap-3.5 px-5 py-3.5',
                  index < members.length - 1 && 'border-b',
                )}
              >
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs font-bold">
                    {initialsOf(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{member.name}</p>
                  <p className="text-muted-foreground truncate text-[12.5px]">{member.email}</p>
                </div>
                <Badge className={roleBadgeClass[member.role]}>
                  {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
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
              </li>
            ))}
          </ul>
        )}
      </div>

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
    </div>
  )
}
