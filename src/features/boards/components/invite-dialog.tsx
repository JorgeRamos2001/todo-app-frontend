import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import type { BoardRole } from '@/api/boards'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateInvitation } from '@/features/invitations/hooks'

const inviteSchema = z.object({
  email: z.email('Enter a valid email address'),
  role: z.enum(['ADMIN', 'MEMBER']),
})

type InviteValues = z.infer<typeof inviteSchema>

interface InviteDialogProps {
  boardId: number
  boardTitle: string
  myRole: BoardRole
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteDialog({
  boardId,
  boardTitle,
  myRole,
  open,
  onOpenChange,
}: InviteDialogProps) {
  const createInvitation = useCreateInvitation(boardId)
  const canInviteAdmins = myRole === 'OWNER'

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'MEMBER' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createInvitation.mutateAsync(values)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError && error.status === 400 && error.errors !== undefined) {
        for (const [field, message] of Object.entries(error.errors)) {
          if (field === 'email' || field === 'role') {
            form.setError(field as keyof InviteValues, { type: 'server', message })
          }
        }
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            They will receive an email invitation to join “{boardTitle}”.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void onSubmit(event)} noValidate>
          <FieldGroup>
            <Field data-invalid={form.formState.errors.email !== undefined}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@company.com"
                aria-invalid={form.formState.errors.email !== undefined}
                {...form.register('email')}
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
            <Field data-invalid={form.formState.errors.role !== undefined}>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="invite-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {canInviteAdmins ? <SelectItem value="ADMIN">Admin</SelectItem> : null}
                      <SelectItem value="MEMBER">Member</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{form.formState.errors.role?.message}</FieldError>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInvitation.isPending}>
              {createInvitation.isPending ? 'Sending…' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
