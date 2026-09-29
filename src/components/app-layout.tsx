import { Link, Outlet } from 'react-router'

import { UserMenu } from '@/auth/user-menu'
import { ModeToggle } from '@/components/mode-toggle'
import { APP_NAME } from '@/lib/constants'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <Link to="/" className="font-heading text-lg font-semibold">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-1">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
