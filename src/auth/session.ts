import { toast } from 'sonner'

import { refresh } from '@/api/auth'
import { setAccessTokenProvider, setUnauthorizedHandler } from '@/api/client'
import { useAuthStore } from '@/auth/store'
import { queryClient } from '@/lib/query-client'

let refreshPromise: Promise<string | null> | null = null
let initialized = false

export function initializeAuth(): void {
  if (initialized) {
    return
  }
  initialized = true
  setAccessTokenProvider(() => useAuthStore.getState().accessToken)
  setUnauthorizedHandler(handleUnauthorized)
}

export function refreshSession(): Promise<string | null> {
  refreshPromise ??= runRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

async function runRefresh(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState()
  if (refreshToken === null) {
    return null
  }

  try {
    const session = await refresh(refreshToken)
    useAuthStore.getState().setSession(session)
    return session.accessToken
  } catch {
    useAuthStore.getState().clearSession()
    return null
  }
}

function handleUnauthorized(): Promise<string | null> {
  return refreshSession().then((token) => {
    if (token === null) {
      toast.error('Your session has expired. Please sign in again.', { id: 'session-expired' })
    }
    return token
  })
}

export async function restoreSession(): Promise<void> {
  const state = useAuthStore.getState()
  if (state.refreshToken === null || state.accessToken !== null) {
    state.setRestoring(false)
    return
  }

  await refreshSession()
  useAuthStore.getState().setRestoring(false)
}

export function logout(): void {
  useAuthStore.getState().clearSession()
  queryClient.clear()
}
