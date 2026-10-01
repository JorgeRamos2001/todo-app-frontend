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
import { useDeleteColumn } from '@/features/columns/hooks'

interface DeleteColumnDialogProps {
  boardId: number
  columnId: number
  columnName: string
  taskCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteColumnDialog({
  boardId,
  columnId,
  columnName,
  taskCount,
  open,
  onOpenChange,
}: DeleteColumnDialogProps) {
  const deleteColumn = useDeleteColumn(boardId)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{columnName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {taskCount === 0
              ? 'This column will be permanently deleted.'
              : `This column and its ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} will be permanently deleted.`}{' '}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            disabled={deleteColumn.isPending}
            onClick={(event) => {
              event.preventDefault()
              deleteColumn.mutate(columnId, { onSuccess: () => onOpenChange(false) })
            }}
          >
            {deleteColumn.isPending ? 'Deleting…' : 'Delete column'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
