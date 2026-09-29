import { useCallback } from 'react'

import { login as loginRequest, register as registerRequest } from '@/api/auth'
import { logout as logoutSession, refreshSession } from '@/auth/session'
import { useAuthStore } from '@/auth/store'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const isRestoring = useAuthStore((state) => state.isRestoring)

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginRequest({ email, password })
    useAuthStore.getState().setSession(session)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const session = await registerRequest({ name, email, password })
    useAuthStore.getState().setSession(session)
  }, [])

  return {
    user,
    isAuthenticated: accessToken !== null,
    isRestoring,
    login,
    register,
    logout: logoutSession,
    refreshSession,
  }
}
