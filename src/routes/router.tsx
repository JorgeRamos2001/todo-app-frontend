import { createBrowserRouter } from 'react-router'

import { GuestRoute } from '@/auth/guest-route'
import { ProtectedRoute } from '@/auth/protected-route'
import { HomePage } from '@/routes/pages/home-page'
import { LoginPage } from '@/routes/pages/login-page'
import { NotFoundPage } from '@/routes/pages/not-found-page'
import { OAuth2CallbackPage } from '@/routes/pages/oauth2-callback-page'
import { RegisterPage } from '@/routes/pages/register-page'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  { path: '/oauth2/callback', element: <OAuth2CallbackPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/', element: <HomePage /> }],
  },
  { path: '*', element: <NotFoundPage /> },
])
