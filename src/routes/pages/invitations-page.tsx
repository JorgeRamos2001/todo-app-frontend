import { CheckIcon, MailIcon, XIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'
import {
  useAcceptInvitation,
  useReceivedInvitations,
  useRejectInvitation,
} from '@/features/invitations/hooks'
import { isOpenInvitation } from '@/features/invitations/utils'
import { getErrorMessage } from '@/lib/errors'
import { formatRelativeTime } from '@/lib/format'
import { initialsOf } from '@/lib/initials'

export function InvitationsPage() {
  const invitationsQuery = useReceivedInvitations()
  const acceptMutation = useAcceptInvitation()
  const rejectMutation = useRejectInvitation()
  const invitations = (invitationsQuery.data ?? []).filter(isOpenInvitation)

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-7 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground text-sm">
          Boards you have been invited to. Accepting adds you as a member.
        </p>
      </div>

      {invitationsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : invitationsQuery.isError ? (
        <ErrorState
          title="Could not load invitations"
          description={getErrorMessage(invitationsQuery.error)}
          action={<Button onClick={() => void invitationsQuery.refetch()}>Retry</Button>}
        />
      ) : invitations.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
          <MailIcon className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="font-medium">No pending invitations</p>
          <p className="text-muted-foreground text-sm">
            When someone invites you to a board it will show up here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {invitations.map((invitation) => {
            const isAccepting =
              acceptMutation.isPending && acceptMutation.variables === invitation.token
            const isRejecting =
              rejectMutation.isPending && rejectMutation.variables === invitation.token
            return (
              <li
                key={invitation.id}
                className="bg-card flex flex-wrap items-center gap-3.5 rounded-2xl border p-4 shadow-sm"
              >
                <Avatar className="size-10">
                  <AvatarFallback className="bg-accent-soft text-accent-text text-xs font-bold">
                    {initialsOf(invitation.inviterName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-bold">{invitation.inviterName}</span>{' '}
                    <span className="text-muted-foreground">
                      invited you to “{invitation.boardTitle}”
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-[12.5px]">
                    Expires {formatRelativeTime(invitation.expiresAt)}
                  </p>
                </div>
                <Badge variant="secondary">{invitation.role}</Badge>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isAccepting || isRejecting}
                    onClick={() => acceptMutation.mutate(invitation.token)}
                  >
                    <CheckIcon />
                    {isAccepting ? 'Accepting…' : 'Accept'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAccepting || isRejecting}
                    onClick={() => rejectMutation.mutate(invitation.token)}
                  >
                    <XIcon />
                    {isRejecting ? 'Declining…' : 'Decline'}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
