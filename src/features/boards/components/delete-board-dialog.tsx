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
import { useDeleteBoard } from '@/features/boards/hooks'

interface DeleteBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: number
  boardTitle: string
  onDeleted?: () => void
}

export function DeleteBoardDialog({
  open,
  onOpenChange,
  boardId,
  boardTitle,
  onDeleted,
}: DeleteBoardDialogProps) {
  const deleteMutation = useDeleteBoard()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{boardTitle}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the board, its columns and every task inside. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            disabled={deleteMutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              deleteMutation.mutate(boardId, {
                onSuccess: () => {
                  onOpenChange(false)
                  onDeleted?.()
                },
              })
            }}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete board'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
