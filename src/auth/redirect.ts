import type { Location } from 'react-router'

export function resolvePostLoginPath(from: Location | undefined): string {
  if (from === undefined) {
    return '/'
  }
  if (!from.pathname.startsWith('/invitations/')) {
    return '/'
  }
  return `${from.pathname}${from.search}`
}
