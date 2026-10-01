import type { BoardActivityAction } from '@/api/activities'

function text(details: Record<string, unknown> | null, key: string): string | null {
  const value = details?.[key]
  return typeof value === 'string' && value !== '' ? value : null
}

export function describeActivity(
  action: BoardActivityAction,
  details: Record<string, unknown> | null,
): string {
  switch (action) {
    case 'BOARD_CREATED':
      return 'created this board'
    case 'BOARD_UPDATED':
      return 'updated the board'
    case 'MEMBER_JOINED':
      return 'joined the board'
    case 'MEMBER_REMOVED': {
      const email = text(details, 'email')
      return email === null ? 'removed a member' : `removed ${email}`
    }
    case 'COLUMN_CREATED': {
      const name = text(details, 'name')
      return name === null ? 'created a column' : `created column “${name}”`
    }
    case 'COLUMN_UPDATED': {
      const name = text(details, 'name')
      return name === null ? 'updated a column' : `updated column “${name}”`
    }
    case 'COLUMN_DELETED': {
      const name = text(details, 'name')
      return name === null ? 'deleted a column' : `deleted column “${name}”`
    }
    case 'TASK_CREATED': {
      const title = text(details, 'title')
      return title === null ? 'created a task' : `created task “${title}”`
    }
    case 'TASK_UPDATED': {
      const title = text(details, 'title')
      return title === null ? 'updated a task' : `updated task “${title}”`
    }
    case 'TASK_MOVED': {
      const title = text(details, 'title')
      return title === null ? 'moved a task' : `moved task “${title}”`
    }
    case 'TASK_ASSIGNED': {
      const title = text(details, 'title')
      const assignee = text(details, 'assigneeName')
      if (title === null || assignee === null) {
        return 'assigned a task'
      }
      return `assigned “${title}” to ${assignee}`
    }
    case 'TASK_DELETED': {
      const title = text(details, 'title')
      return title === null ? 'deleted a task' : `deleted task “${title}”`
    }
    case 'SUBTASK_CREATED':
      return 'added a subtask'
    case 'SUBTASK_UPDATED':
      return 'updated a subtask'
    case 'SUBTASK_DELETED':
      return 'deleted a subtask'
    case 'COMMENT_CREATED': {
      const preview = text(details, 'preview')
      return preview === null ? 'commented on a task' : `commented: “${preview}”`
    }
    case 'COMMENT_DELETED':
      return 'deleted a comment'
    case 'INVITATION_CREATED': {
      const email = text(details, 'email')
      return email === null ? 'invited someone' : `invited ${email}`
    }
    case 'INVITATION_ACCEPTED':
      return 'accepted an invitation'
    case 'INVITATION_REJECTED':
      return 'declined an invitation'
  }
}
