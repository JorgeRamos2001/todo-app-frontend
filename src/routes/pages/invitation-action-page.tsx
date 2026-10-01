import { useEffect, useRef, useState } from 'react'

import { CheckIcon, XIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import type { Invitation } from '@/api/invitations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FullPageLoader } from '@/components/full-page-loader'
import { ErrorState } from '@/components/error-state'
import { describeInvitationError } from '@/features/invitations/error-message'
import { useAcceptInvitation, useRejectInvitation } from '@/features/invitations/hooks'

type Outcome = { status: 'success'; invitation: Invitation } | { status: 'error'; message: string }

export function InvitationActionPage({ mode }: { mode: 'accept' | 'reject' }) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const started = useRef(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const acceptMutation = useAcceptInvitation({ silentError: true })
  const rejectMutation = useRejectInvitation({ silentError: true })

  useEffect(() => {
    if (token === null || started.current) {
      return
    }
    started.current = true
    const mutation = mode === 'accept' ? acceptMutation : rejectMutation
    mutation
      .mutateAsync(token)
      .then((invitation) => setOutcome({ status: 'success', invitation }))
      .catch((error: unknown) =>
        setOutcome({ status: 'error', message: describeInvitationError(error) }),
      )
  }, [acceptMutation, mode, rejectMutation, token])

  if (token === null) {
    return (
      <div className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
        <ErrorState
          title="Invalid invitation link"
          description="The link is missing its invitation token."
          action={
            <Button asChild>
              <Link to="/invitations">Go to invitations</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (outcome === null) {
    return <FullPageLoader />
  }

  if (outcome.status === 'error') {
    return (
      <div className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
        <ErrorState
          title={
            mode === 'accept'
              ? 'Could not accept the invitation'
              : 'Could not decline the invitation'
          }
          description={outcome.message}
          action={
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/invitations">Go to invitations</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Back home</Link>
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  const accepted = mode === 'accept'

  return (
    <div className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div
            className={
              accepted
                ? 'bg-success-soft text-success flex size-12 items-center justify-center rounded-2xl'
                : 'bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-2xl'
            }
          >
            {accepted ? <CheckIcon className="size-6" /> : <XIcon className="size-6" />}
          </div>
          <CardTitle className="font-heading text-xl">
            {accepted ? 'Invitation accepted' : 'Invitation declined'}
          </CardTitle>
          <CardDescription>
            {accepted
              ? `You are now a member of “${outcome.invitation.boardTitle}”.`
              : `You declined the invitation to “${outcome.invitation.boardTitle}”.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          {accepted ? (
            <Button asChild>
              <Link to={`/boards/${outcome.invitation.boardId}`}>Open board</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link to="/invitations">Go to invitations</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
