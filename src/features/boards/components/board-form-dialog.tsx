import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useBoard, useCreateBoard, useUpdateBoard } from '@/features/boards/hooks'
import { boardFormSchema, type BoardFormValues } from '@/features/boards/schemas'

interface BoardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId?: number
}

export function BoardFormDialog({ open, onOpenChange, boardId }: BoardFormDialogProps) {
  const navigate = useNavigate()
  const isEditing = boardId !== undefined
  const boardQuery = useBoard(isEditing && open ? boardId : null)
  const createMutation = useCreateBoard()
  const updateMutation = useUpdateBoard(boardId ?? -1)
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: { title: '', description: '', type: 'PERSONAL' },
  })

  const board = boardQuery.data

  useEffect(() => {
    if (!open) {
      return
    }
    form.reset({
      title: board?.title ?? '',
      description: board?.description ?? '',
      type: board?.type ?? 'PERSONAL',
    })
  }, [board, form, open])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ title: values.title, description: values.description })
        onOpenChange(false)
        return
      }

      const created = await createMutation.mutateAsync({
        title: values.title,
        description: values.description === '' ? undefined : values.description,
        type: values.type,
      })
      onOpenChange(false)
      void navigate(`/boards/${created.id}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 400 && error.errors !== undefined) {
        for (const [field, message] of Object.entries(error.errors)) {
          if (field === 'title' || field === 'description' || field === 'type') {
            form.setError(field as keyof BoardFormValues, { type: 'server', message })
          }
        }
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit board' : 'New board'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the board title and description.'
              : 'Boards group your columns and tasks.'}
          </DialogDescription>
        </DialogHeader>
        {isEditing && boardQuery.isPending ? (
          <Skeleton className="h-44 w-full" />
        ) : (
          <form onSubmit={(event) => void onSubmit(event)} noValidate>
            <FieldGroup>
              <Field data-invalid={form.formState.errors.title !== undefined}>
                <FieldLabel htmlFor="board-title">Title</FieldLabel>
                <Input
                  id="board-title"
                  aria-invalid={form.formState.errors.title !== undefined}
                  {...form.register('title')}
                />
                <FieldError>{form.formState.errors.title?.message}</FieldError>
              </Field>
              <Field data-invalid={form.formState.errors.description !== undefined}>
                <FieldLabel htmlFor="board-description">Description</FieldLabel>
                <Textarea
                  id="board-description"
                  rows={3}
                  aria-invalid={form.formState.errors.description !== undefined}
                  {...form.register('description')}
                />
                <FieldError>{form.formState.errors.description?.message}</FieldError>
              </Field>
              {isEditing ? null : (
                <Field data-invalid={form.formState.errors.type !== undefined}>
                  <FieldLabel htmlFor="board-type">Type</FieldLabel>
                  <Controller
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="board-type" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERSONAL">Personal</SelectItem>
                          <SelectItem value="COLLABORATIVE">Collaborative</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError>{form.formState.errors.type?.message}</FieldError>
                </Field>
              )}
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create board'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
