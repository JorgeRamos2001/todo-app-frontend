import type { AuthUser } from '@/auth/types'

export interface JwtPayload {
  sub: string
  email: string
  name: string
  iat: number
  exp: number
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }

  const encodedPayload = parts[1]
  if (encodedPayload === undefined || encodedPayload === '') {
    return null
  }

  try {
    const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const parsed: unknown = JSON.parse(atob(padded))

    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }

    const claims = parsed as Record<string, unknown>
    if (
      typeof claims.sub !== 'string' ||
      typeof claims.email !== 'string' ||
      typeof claims.name !== 'string'
    ) {
      return null
    }

    return {
      sub: claims.sub,
      email: claims.email,
      name: claims.name,
      iat: typeof claims.iat === 'number' ? claims.iat : 0,
      exp: typeof claims.exp === 'number' ? claims.exp : 0,
    }
  } catch {
    return null
  }
}

export function toAuthUser(payload: JwtPayload | null): AuthUser | null {
  if (payload === null) {
    return null
  }

  const id = Number(payload.sub)
  if (!Number.isInteger(id)) {
    return null
  }

  return { id, name: payload.name, email: payload.email }
}
