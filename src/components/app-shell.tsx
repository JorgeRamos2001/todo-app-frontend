import { useState } from 'react'

import {
  BellIcon,
  ChevronDownIcon,
  HouseIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router'

import { LogoutDialog } from '@/auth/logout-dialog'
import { useAuth } from '@/auth/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { boardDot } from '@/features/boards/board-visuals'
import { useBoards } from '@/features/boards/hooks'
import { useReceivedInvitations } from '@/features/invitations/hooks'
import { openInvitationCount } from '@/features/invitations/utils'
import { initialsOf } from '@/lib/initials'
import { cn } from '@/lib/utils'

const rowClass =
  'flex h-[38px] w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors'

function navClass({ isActive }: { isActive: boolean }): string {
  return cn(
    rowClass,
    isActive
      ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
  )
}

function boardNavClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-[13.5px] font-medium transition-colors',
    isActive
      ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
  )
}

function ThemeMenu() {
  const { theme, setTheme } = useTheme()
  const resolved = theme ?? 'system'
  const Icon = resolved === 'dark' ? MoonIcon : resolved === 'light' ? SunIcon : MonitorIcon
  const label =
    resolved === 'system' ? 'System theme' : resolved === 'dark' ? 'Dark theme' : 'Light theme'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn(rowClass, 'text-muted-foreground hover:bg-accent')}>
          <Icon className="size-4" />
          <span className="flex-1 text-left">{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <SunIcon />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <MoonIcon />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <MonitorIcon />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const boardsQuery = useBoards()
  const invitationsQuery = useReceivedInvitations()
  const pendingInvitations = openInvitationCount(invitationsQuery.data ?? [])
  const boards = boardsQuery.data ?? []
  const name = user?.name ?? 'Account'

  return (
    <div className="flex h-full flex-col gap-1.5 p-3.5">
      <div className="bg-card flex h-14 items-center gap-2.5 rounded-2xl border px-3">
        <Avatar className="size-8 rounded-xl">
          <AvatarFallback className="bg-foreground text-background rounded-xl text-xs font-bold">
            {initialsOf(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-semibold">Your workspace</p>
          <p className="truncate text-[13.5px] font-bold">{name}</p>
        </div>
        <ChevronDownIcon className="text-muted-foreground size-4" />
      </div>

      <p className="text-muted-foreground/80 mt-2 px-3 text-[11px] font-bold tracking-[0.09em] uppercase">
        Main menu
      </p>
      <NavLink to="/" end className={navClass} onClick={onNavigate}>
        <HouseIcon className="size-4" />
        Home
      </NavLink>
      <NavLink to="/invitations" className={navClass} onClick={onNavigate}>
        <MailIcon className="size-4" />
        Invitations
        {pendingInvitations > 0 ? (
          <span className="bg-primary text-primary-foreground ml-auto flex size-5 items-center justify-center rounded-full text-[11px] font-bold">
            {pendingInvitations}
          </span>
        ) : null}
      </NavLink>
      <NavLink to="/profile" className={navClass} onClick={onNavigate}>
        <UserIcon className="size-4" />
        Profile
      </NavLink>

      <div className="mt-3 flex items-center justify-between px-3">
        <p className="text-muted-foreground/80 text-[11px] font-bold tracking-[0.09em] uppercase">
          My boards
        </p>
        <Link
          to="/?new=1"
          aria-label="New board"
          className="text-muted-foreground hover:text-foreground"
          onClick={onNavigate}
        >
          <PlusIcon className="size-3.5" />
        </Link>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {boards.map((board, index) => (
          <NavLink
            key={board.id}
            to={`/boards/${board.id}`}
            className={boardNavClass}
            onClick={onNavigate}
          >
            <span className={cn('size-2.5 shrink-0 rounded-full', boardDot(index))} />
            <span className="truncate">{board.title}</span>
          </NavLink>
        ))}
        {!boardsQuery.isPending && boards.length === 0 ? (
          <p className="text-muted-foreground px-3 py-1 text-xs">No boards yet</p>
        ) : null}
      </nav>

      <div className="mt-2 flex flex-col gap-0.5 border-t pt-2">
        <ThemeMenu />
        <button
          type="button"
          className={cn(rowClass, 'text-muted-foreground hover:bg-accent hover:text-foreground')}
          onClick={() => setLogoutOpen(true)}
        >
          <LogOutIcon className="size-4" />
          Log out
        </button>
      </div>
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  )
}

function BoardSearchInput() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return (
    <div className="relative hidden w-full max-w-xs md:block">
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={query}
        onChange={(event) => {
          const next = new URLSearchParams(searchParams)
          if (event.target.value === '') {
            next.delete('q')
          } else {
            next.set('q', event.target.value)
          }
          setSearchParams(next, { replace: true })
        }}
        placeholder="Search boards..."
        aria-label="Search boards"
        className="bg-card h-10 rounded-xl pl-9"
      />
    </div>
  )
}

function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const boardsQuery = useBoards()
  const invitationsQuery = useReceivedInvitations()
  const pendingInvitations = openInvitationCount(invitationsQuery.data ?? [])
  const isHome = location.pathname === '/'
  const name = user?.name ?? 'Account'

  let pageLabel = 'Boards'
  if (location.pathname.startsWith('/boards/')) {
    const boardId = Number(location.pathname.split('/')[2])
    pageLabel = boardsQuery.data?.find((board) => board.id === boardId)?.title ?? 'Board'
  } else if (location.pathname.startsWith('/invitations')) {
    pageLabel = 'Invitations'
  } else if (location.pathname.startsWith('/profile')) {
    pageLabel = 'Profile'
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenMobile}
        >
          <MenuIcon className="size-5" />
        </Button>
        <div className="hidden min-w-0 items-center gap-2 text-[13.5px] sm:flex">
          <span className="text-muted-foreground font-medium">Workspace</span>
          <span className="text-muted-foreground">/</span>
          <span className="truncate font-bold">{pageLabel}</span>
        </div>
        {isHome ? <BoardSearchInput /> : null}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" className="bg-card relative rounded-xl" asChild>
            <Link to="/invitations" aria-label="Invitations">
              <BellIcon className="size-4" />
              {pendingInvitations > 0 ? (
                <span className="border-card bg-primary absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2" />
              ) : null}
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-accent-soft hover:bg-accent-soft/80 rounded-xl"
                aria-label="Account menu"
              >
                <Avatar className="size-8 rounded-xl">
                  <AvatarFallback className="text-accent-text rounded-xl bg-transparent text-xs font-bold">
                    {initialsOf(name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{name}</span>
                  {user === null ? null : (
                    <span className="text-muted-foreground text-xs font-normal">{user.email}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void navigate('/profile')}>
                <UserIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLogoutOpen(true)}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </header>
  )
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bg-background flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-[264px] shrink-0 border-r lg:block">
        <SidebarContent />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <Outlet />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] gap-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
