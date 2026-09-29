import { ApiError } from '@/api/client'

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiError) {
    if (error.detail !== '') {
      return error.detail
    }
    return error.title
  }
  if (error instanceof Error && error.message !== '') {
    return error.message
  }
  return fallback
}
