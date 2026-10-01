import { createBrowserRouter } from 'react-router'

import { GuestRoute } from '@/auth/guest-route'
import { ProtectedRoute } from '@/auth/protected-route'
import { AppShell } from '@/components/app-shell'
import { BoardDetailPage } from '@/routes/pages/board-detail-page'
import { BoardsPage } from '@/routes/pages/boards-page'
import { InvitationActionPage } from '@/routes/pages/invitation-action-page'
import { InvitationsPage } from '@/routes/pages/invitations-page'
import { LoginPage } from '@/routes/pages/login-page'
import { NotFoundPage } from '@/routes/pages/not-found-page'
import { OAuth2CallbackPage } from '@/routes/pages/oauth2-callback-page'
import { ProfilePage } from '@/routes/pages/profile-page'
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
        element: <AppShell />,
        children: [
          { path: '/', element: <BoardsPage /> },
          { path: '/boards/:boardId', element: <BoardDetailPage /> },
          { path: '/invitations', element: <InvitationsPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
      { path: '/invitations/accept', element: <InvitationActionPage mode="accept" /> },
      { path: '/invitations/reject', element: <InvitationActionPage mode="reject" /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
