import { ModeToggle } from '@/components/mode-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/auth/use-auth'
import { UserMenu } from '@/auth/user-menu'
import { APP_NAME } from '@/lib/constants'

export function HomePage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <span className="font-heading text-lg font-semibold">{APP_NAME}</span>
        <div className="flex items-center gap-1">
          <ModeToggle />
          <UserMenu />
        </div>
      </header>
      <main className="bg-muted/40 flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Phase 1 — Authentication ready</CardTitle>
            <CardDescription>
              {user === null
                ? 'Your session is active.'
                : `Signed in as ${user.name} (${user.email}).`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Token refresh, Google sign-in and route guards are wired up. The board grid lands in
              Phase 2.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
