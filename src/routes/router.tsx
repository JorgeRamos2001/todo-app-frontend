import { createBrowserRouter } from 'react-router'

import { GuestRoute } from '@/auth/guest-route'
import { ProtectedRoute } from '@/auth/protected-route'
import { AppLayout } from '@/components/app-layout'
import { BoardDetailPage } from '@/routes/pages/board-detail-page'
import { BoardsPage } from '@/routes/pages/boards-page'
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
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <BoardsPage /> },
          { path: '/boards/:boardId', element: <BoardDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
