import { ApiError } from '@/api/client'

export function describeInvitationError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'This invitation link is not valid anymore.'
    }
    if (error.status === 403) {
      return 'This invitation was sent to a different email address. Sign in with the invited account and try again.'
    }
    if (error.detail !== '') {
      return error.detail
    }
    return error.title
  }
  return 'Something went wrong. Please try again.'
}
