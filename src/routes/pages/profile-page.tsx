import { LogOutIcon, MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useNavigate } from 'react-router'

import { useAuth } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { initialsOf } from '@/lib/initials'
import { cn } from '@/lib/utils'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
] as const

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const name = user?.name ?? 'Account'
  const currentTheme = theme ?? 'system'

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm">Your account details and how the app looks.</p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[400px_1fr]">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="bg-accent-soft flex size-18 items-center justify-center rounded-2xl">
              <span className="font-heading text-accent-text text-2xl font-semibold">
                {initialsOf(name)}
              </span>
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">{name}</p>
              <p className="text-muted-foreground text-[13.5px]">{user?.email ?? ''}</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-[13px] font-semibold">Name</span>
              <span className="text-[13.5px] font-semibold">{name}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-[13px] font-semibold">Email</span>
              <span className="text-[13.5px] font-semibold">{user?.email ?? ''}</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Account details can't be edited from the app yet.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Appearance</CardTitle>
              <CardDescription>Choose how Todo App looks on this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted flex w-fit items-center gap-1 rounded-xl p-1">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const active = currentTheme === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'flex h-9 items-center gap-2 rounded-[10px] px-3.5 text-[13px] font-semibold transition-colors',
                        active
                          ? 'bg-card text-foreground ring-border shadow-sm ring-1'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Icon className={cn('size-4', active && 'text-accent-text')} />
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-muted-foreground text-xs">Your choice is saved on this device.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Session</CardTitle>
              <CardDescription>
                You are signed in as {user?.email ?? 'your account'}. Signing out clears this
                session on this device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                onClick={() => {
                  logout()
                  void navigate('/login', { replace: true })
                }}
              >
                <LogOutIcon />
                Log out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
