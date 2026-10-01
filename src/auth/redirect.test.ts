import type { Location } from 'react-router'

import { resolvePostLoginPath } from '@/auth/redirect'

function location(pathname: string, search = ''): Location {
  return {
    pathname,
    search,
    hash: '',
    state: null,
    key: 'test',
  }
}

describe('resolvePostLoginPath', () => {
  it('defaults to home when there is no redirect target', () => {
    expect(resolvePostLoginPath(undefined)).toBe('/')
  })

  it('never returns stale board or profile targets', () => {
    expect(resolvePostLoginPath(location('/boards/4'))).toBe('/')
    expect(resolvePostLoginPath(location('/profile'))).toBe('/')
    expect(resolvePostLoginPath(location('/invitations'))).toBe('/')
  })

  it('keeps invitation deep links with their token', () => {
    expect(resolvePostLoginPath(location('/invitations/accept', '?token=abc'))).toBe(
      '/invitations/accept?token=abc',
    )
    expect(resolvePostLoginPath(location('/invitations/reject', '?token=xyz'))).toBe(
      '/invitations/reject?token=xyz',
    )
  })
})
