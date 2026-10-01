import { ApiError } from '@/api/client'
import { describeInvitationError } from '@/features/invitations/error-message'

describe('describeInvitationError', () => {
  it('explains missing invitations', () => {
    expect(
      describeInvitationError(new ApiError({ status: 404, title: 'Resource not found' })),
    ).toBe('This invitation link is not valid anymore.')
  })

  it('explains invitations for a different account', () => {
    expect(
      describeInvitationError(
        new ApiError({
          status: 403,
          title: 'Forbidden',
          detail: 'Invitation is for a different email address',
        }),
      ),
    ).toContain('different email address')
  })

  it('passes backend details through for conflicts', () => {
    expect(
      describeInvitationError(
        new ApiError({ status: 409, title: 'Conflict', detail: 'Invitation has expired' }),
      ),
    ).toBe('Invitation has expired')
  })

  it('falls back for unknown errors', () => {
    expect(describeInvitationError(new Error('boom'))).toBe(
      'Something went wrong. Please try again.',
    )
  })
})
