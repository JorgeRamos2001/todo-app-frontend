import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuthStore } from '@/auth/store'
import { FullPageLoader } from '@/components/full-page-loader'

export function ProtectedRoute() {
  const location = useLocation()
  const isRestoring = useAuthStore((state) => state.isRestoring)
  const accessToken = useAuthStore((state) => state.accessToken)

  if (isRestoring) {
    return <FullPageLoader />
  }

  if (accessToken === null) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
