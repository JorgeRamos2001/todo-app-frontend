import { create } from 'zustand'

import { decodeJwt, toAuthUser } from '@/auth/decode-jwt'
import type { AuthUser } from '@/auth/types'

const REFRESH_TOKEN_KEY = 'todo-app.refreshToken'

export interface AuthSession {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isRestoring: boolean
  setSession: (session: AuthSession) => void
  clearSession: () => void
  setRestoring: (isRestoring: boolean) => void
}

function readStoredRefreshToken(): string | null {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

function persistRefreshToken(token: string | null): void {
  try {
    if (token === null) {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    } else {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token)
    }
  } catch {
    return
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: readStoredRefreshToken(),
  user: null,
  isRestoring: true,
  setSession: ({ accessToken, refreshToken }) => {
    persistRefreshToken(refreshToken)
    set({ accessToken, refreshToken, user: toAuthUser(decodeJwt(accessToken)) })
  },
  clearSession: () => {
    persistRefreshToken(null)
    set({ accessToken: null, refreshToken: null, user: null })
  },
  setRestoring: (isRestoring) => set({ isRestoring }),
}))
