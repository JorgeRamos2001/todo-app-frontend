import { format, formatDistanceToNow } from 'date-fns'

export function formatRelativeTime(isoDate: string): string {
  return formatDistanceToNow(new Date(isoDate), { addSuffix: true })
}

export function formatDate(isoDate: string): string {
  return format(new Date(isoDate), 'MMM d, yyyy')
}

export function getGreeting(date = new Date()): string {
  const hours = date.getHours()
  if (hours < 12) {
    return 'Good morning'
  }
  if (hours < 18) {
    return 'Good afternoon'
  }
  return 'Good evening'
}

export function firstNameOf(fullName: string): string {
  return fullName.trim().split(' ')[0] ?? fullName
}
