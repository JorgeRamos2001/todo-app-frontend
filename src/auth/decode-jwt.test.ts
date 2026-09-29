import { decodeJwt, toAuthUser } from '@/auth/decode-jwt'

function encodePayload(payload: unknown): string {
  const base64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `header.${base64}.signature`
}

describe('decodeJwt', () => {
  it('decodes a valid payload', () => {
    const token = encodePayload({ sub: '7', email: 'ada@example.com', name: 'Ada', iat: 1, exp: 2 })

    expect(decodeJwt(token)).toEqual({
      sub: '7',
      email: 'ada@example.com',
      name: 'Ada',
      iat: 1,
      exp: 2,
    })
  })

  it('returns null for malformed tokens', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull()
    expect(decodeJwt('a.%%%.c')).toBeNull()
  })

  it('returns null when required claims are missing', () => {
    expect(decodeJwt(encodePayload({ sub: '7' }))).toBeNull()
  })
})

describe('toAuthUser', () => {
  it('maps claims to a user', () => {
    const user = toAuthUser({ sub: '3', email: 'x@y.z', name: 'X', iat: 0, exp: 0 })

    expect(user).toEqual({ id: 3, name: 'X', email: 'x@y.z' })
  })

  it('returns null when sub is not numeric or payload is missing', () => {
    expect(toAuthUser({ sub: 'abc', email: 'x@y.z', name: 'X', iat: 0, exp: 0 })).toBeNull()
    expect(toAuthUser(null)).toBeNull()
  })
})
