import { useEffect, useRef } from 'react'

import { Link, useNavigate } from 'react-router'

import { useAuthStore } from '@/auth/store'
import { ErrorState } from '@/components/error-state'
import { FullPageLoader } from '@/components/full-page-loader'
import { Button } from '@/components/ui/button'

export function OAuth2CallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('accessToken')
  const refreshToken = params.get('refreshToken')
  const hasTokens = accessToken !== null && refreshToken !== null

  useEffect(() => {
    if (handled.current || accessToken === null || refreshToken === null) {
      return
    }
    handled.current = true
    useAuthStore.getState().setSession({ accessToken, refreshToken })
    void navigate('/', { replace: true })
  }, [accessToken, navigate, refreshToken])

  if (!hasTokens) {
    return (
      <div className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
        <ErrorState
          title="Sign in failed"
          description="The sign-in provider did not return a valid session."
          action={
            <Button asChild>
              <Link to="/login">Back to sign in</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return <FullPageLoader />
}
