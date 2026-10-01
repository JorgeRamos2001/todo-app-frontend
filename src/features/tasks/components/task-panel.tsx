import { useState } from 'react'

import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  Columns3Icon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react'

import type { BoardDetail, BoardRole } from '@/api/boards'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  canAssignTask,
  canDeleteComment,
  canDeleteTask,
  canEditTask,
  canManageSubtasks,
} from '@/features/boards/permissions'
import { TaskCardPreview } from '@/features/tasks/components/task-card'
import { TASK_AVATAR_COLORS } from '@/lib/avatar-colors'
import {
  useAssignTask,
  useComments,
  useCreateComment,
  useCreateSubtask,
  useDeleteComment,
  useDeleteSubtask,
  useDeleteTask,
  useSubtasks,
  useUpdateSubtask,
  useUpdateTask,
} from '@/features/tasks/hooks'
import { formatDate, formatRelativeTime } from '@/lib/format'
import { initialsOf } from '@/lib/initials'
import { cn } from '@/lib/utils'

interface TaskPanelProps {
  board: BoardDetail
  taskId: number
  myRole: BoardRole
  myUserId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PropRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-7 items-center gap-3">
      <div className="text-muted-foreground flex w-[128px] shrink-0 items-center gap-2 text-[13px] font-semibold">
        <Icon className="text-muted-foreground/70 size-4" />
        {label}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
    </div>
  )
}

export function TaskPanel({ board, taskId, myRole, myUserId, open, onOpenChange }: TaskPanelProps) {
  const task = board.columns.flatMap((column) => column.tasks).find((item) => item.id === taskId)
  const column =
    task === undefined ? undefined : board.columns.find((item) => item.id === task.columnId)

  const [section, setSection] = useState<'subtasks' | 'comments'>('subtasks')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateTask = useUpdateTask(board.id)
  const deleteTask = useDeleteTask(board.id)
  const assignTask = useAssignTask(board.id)
  const subtasksQuery = useSubtasks(taskId, open)
  const commentsQuery = useComments(taskId, open)
  const createSubtask = useCreateSubtask(taskId)
  const updateSubtask = useUpdateSubtask(taskId)
  const deleteSubtask = useDeleteSubtask(taskId)
  const createComment = useCreateComment(taskId)
  const deleteComment = useDeleteComment(taskId)

  if (task === undefined) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-[560px]" />
      </Sheet>
    )
  }

  const subtasks = subtasksQuery.data ?? []
  const comments = commentsQuery.data ?? []
  const doneCount = subtasks.filter((subtask) => subtask.done).length
  const progress = subtasks.length === 0 ? 0 : Math.round((doneCount / subtasks.length) * 100)

  const canEdit = canEditTask(myRole, task, myUserId)
  const canDelete = canDeleteTask(myRole)
  const canAssign = canAssignTask(myRole)
  const canSubtask = canManageSubtasks(myRole, task, myUserId)
  const assignee =
    task.assigneeId === null
      ? null
      : board.members.find((member) => member.userId === task.assigneeId)

  const saveTitle = () => {
    const title = titleDraft.trim()
    setEditingTitle(false)
    if (title === '' || title === task.title) {
      return
    }
    updateTask.mutate({ taskId: task.id, body: { title } })
  }

  const saveDescription = () => {
    setEditingDescription(false)
    const next = descriptionDraft.trim()
    const current = task.description ?? ''
    if (next === current) {
      return
    }
    updateTask.mutate({ taskId: task.id, body: { description: next } })
  }

  const submitSubtask = () => {
    const title = subtaskTitle.trim()
    if (title === '') {
      return
    }
    createSubtask.mutate(title, {
      onSuccess: () => {
        setSubtaskTitle('')
        setAddingSubtask(false)
      },
    })
  }

  const submitComment = () => {
    const content = commentDraft.trim()
    if (content === '') {
      return
    }
    createComment.mutate(content, { onSuccess: () => setCommentDraft('') })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[560px]">
          <SheetTitle className="sr-only">Task details</SheetTitle>
          <div className="border-b p-5 pr-12">
            <div className="flex items-start gap-2">
              {editingTitle ? (
                <Input
                  value={titleDraft}
                  autoFocus
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      saveTitle()
                    }
                    if (event.key === 'Escape') {
                      setEditingTitle(false)
                    }
                  }}
                  className="font-heading h-10 flex-1 rounded-xl text-lg font-semibold"
                />
              ) : (
                <h2 className="font-heading flex-1 text-xl leading-snug font-semibold">
                  {task.title}
                </h2>
              )}
              {canEdit ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit title"
                  onClick={() => {
                    setTitleDraft(task.title)
                    setEditingTitle(true)
                  }}
                >
                  <PencilIcon />
                </Button>
              ) : null}
              {canDelete ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete task"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2Icon />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <div className="space-y-2.5">
              <PropRow icon={Columns3Icon} label="Status">
                <span className="bg-accent-soft text-accent-text flex h-6 items-center gap-2 rounded-full px-3 text-xs font-bold">
                  <span className="bg-primary size-2 rounded-full" />
                  {column?.name ?? 'Unknown'}
                </span>
              </PropRow>
              <PropRow icon={UserIcon} label="Assignee">
                {canAssign ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="hover:bg-accent flex items-center gap-2 rounded-lg px-1 py-0.5 text-[13.5px] font-semibold"
                      >
                        {assignee === undefined || assignee === null ? (
                          <span className="text-muted-foreground">Unassigned</span>
                        ) : (
                          <>
                            <Avatar className="size-6">
                              <AvatarFallback
                                className={cn(
                                  'text-[10px] font-bold',
                                  TASK_AVATAR_COLORS[assignee.userId % TASK_AVATAR_COLORS.length],
                                )}
                              >
                                {initialsOf(assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                            {assignee.name}
                          </>
                        )}
                        <ChevronDownIcon className="text-muted-foreground size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                      {board.members.map((member) => (
                        <DropdownMenuItem
                          key={member.id}
                          onSelect={() =>
                            assignTask.mutate({ taskId: task.id, userId: member.userId })
                          }
                        >
                          <Avatar className="size-5">
                            <AvatarFallback className="text-[9px] font-bold">
                              {initialsOf(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate">{member.name}</span>
                          {member.userId === task.assigneeId ? <CheckIcon /> : null}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span className="flex items-center gap-2 text-[13.5px] font-semibold">
                    {assignee === undefined || assignee === null ? (
                      <span className="text-muted-foreground">Unassigned</span>
                    ) : (
                      <>
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px] font-bold">
                            {initialsOf(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        {assignee.name}
                      </>
                    )}
                  </span>
                )}
              </PropRow>
              <PropRow icon={CalendarIcon} label="Created">
                <span className="text-[13.5px]">{formatDate(task.createdAt)}</span>
              </PropRow>
              <PropRow icon={PencilIcon} label="Last edited">
                <span className="text-[13.5px]">{formatRelativeTime(task.updatedAt)}</span>
              </PropRow>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-[13px] font-bold">Description</p>
              {editingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={descriptionDraft}
                    autoFocus
                    rows={4}
                    onChange={(event) => setDescriptionDraft(event.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={saveDescription} disabled={updateTask.isPending}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingDescription(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => {
                    setDescriptionDraft(task.description ?? '')
                    setEditingDescription(true)
                  }}
                  className={cn(
                    'w-full rounded-xl p-2 text-left text-[13.5px] leading-relaxed transition-colors',
                    canEdit && 'hover:bg-accent',
                  )}
                >
                  {task.description === null || task.description === '' ? (
                    <span className="text-muted-foreground">
                      {canEdit ? 'Add a description…' : 'No description'}
                    </span>
                  ) : (
                    task.description
                  )}
                </button>
              )}
            </div>

            <div className="bg-muted flex w-fit items-center gap-1 rounded-xl p-1">
              {(
                [
                  ['subtasks', `Subtasks ${subtasks.length}`],
                  ['comments', `Comments ${comments.length}`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={cn(
                    'flex h-8 items-center rounded-[10px] px-3.5 text-[13px] font-semibold transition-colors',
                    section === id
                      ? 'bg-card text-foreground ring-border shadow-sm ring-1'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {section === 'subtasks' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold">Checklist</h3>
                  <span className="text-muted-foreground text-xs font-semibold">
                    {doneCount} of {subtasks.length} completed
                  </span>
                  {canSubtask ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setAddingSubtask(true)}
                    >
                      <PlusIcon />
                      Add
                    </Button>
                  ) : null}
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {subtasksQuery.isPending ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : (
                  <ul className="space-y-1">
                    {subtasks.map((subtask) => (
                      <li key={subtask.id} className="group flex items-center gap-3 py-1">
                        <Checkbox
                          checked={subtask.done}
                          disabled={!canSubtask}
                          onCheckedChange={(checked) =>
                            updateSubtask.mutate({
                              subtaskId: subtask.id,
                              body: { done: checked === true },
                            })
                          }
                        />
                        <span
                          className={cn(
                            'flex-1 text-[13.5px] font-semibold',
                            subtask.done && 'text-muted-foreground line-through',
                          )}
                        >
                          {subtask.title}
                        </span>
                        {canSubtask ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${subtask.title}`}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => deleteSubtask.mutate(subtask.id)}
                          >
                            <Trash2Icon />
                          </Button>
                        ) : null}
                      </li>
                    ))}
                    {subtasks.length === 0 ? (
                      <li className="text-muted-foreground py-1 text-[13px]">No subtasks yet</li>
                    ) : null}
                  </ul>
                )}
                {canSubtask && addingSubtask ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      submitSubtask()
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={subtaskTitle}
                      autoFocus
                      placeholder="Subtask title..."
                      onChange={(event) => setSubtaskTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          setAddingSubtask(false)
                          setSubtaskTitle('')
                        }
                      }}
                      className="h-9 rounded-xl"
                    />
                    <Button type="submit" size="sm" disabled={createSubtask.isPending}>
                      Add
                    </Button>
                  </form>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">
                  Comments{' '}
                  <span className="bg-muted text-muted-foreground ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold">
                    {comments.length}
                  </span>
                </h3>
                {commentsQuery.isPending ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : comments.length === 0 ? (
                  <p className="text-muted-foreground text-[13px]">
                    No comments yet. Start the conversation.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {comments.map((comment) => (
                      <li key={comment.id} className="group flex items-start gap-3">
                        <Avatar className="size-7">
                          <AvatarFallback
                            className={cn(
                              'text-[10px] font-bold',
                              TASK_AVATAR_COLORS[comment.authorId % TASK_AVATAR_COLORS.length],
                            )}
                          >
                            {initialsOf(comment.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold">{comment.authorName}</span>
                            <span className="text-muted-foreground text-[11.5px]">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                            {canDeleteComment(myRole, comment.authorId, myUserId) ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Delete comment"
                                className="ml-auto size-6 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => deleteComment.mutate(comment.id)}
                              >
                                <Trash2Icon className="size-3.5" />
                              </Button>
                            ) : null}
                          </div>
                          <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    submitComment()
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={commentDraft}
                    placeholder="Write a comment..."
                    onChange={(event) => setCommentDraft(event.target.value)}
                    className="h-11 rounded-xl"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="size-11 rounded-xl"
                    aria-label="Send comment"
                    disabled={createComment.isPending || commentDraft.trim() === ''}
                  >
                    <SendIcon />
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <TaskCardPreview task={task} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{task.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the task with its subtasks and comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={deleteTask.isPending}
              onClick={(event) => {
                event.preventDefault()
                deleteTask.mutate(task.id, {
                  onSuccess: () => {
                    setDeleteOpen(false)
                    onOpenChange(false)
                  },
                })
              }}
            >
              {deleteTask.isPending ? 'Deleting…' : 'Delete task'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
