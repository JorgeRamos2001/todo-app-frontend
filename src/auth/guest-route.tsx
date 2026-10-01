import { Navigate, Outlet, useLocation } from 'react-router'
import type { Location } from 'react-router'

import { resolvePostLoginPath } from '@/auth/redirect'
import { useAuthStore } from '@/auth/store'
import { FullPageLoader } from '@/components/full-page-loader'

export function GuestRoute() {
  const location = useLocation()
  const isRestoring = useAuthStore((state) => state.isRestoring)
  const accessToken = useAuthStore((state) => state.accessToken)

  if (isRestoring) {
    return <FullPageLoader />
  }

  if (accessToken !== null) {
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={resolvePostLoginPath(from)} replace />
  }

  return <Outlet />
}
