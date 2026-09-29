import { Link } from 'react-router'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'

export function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <span className="font-heading text-lg font-semibold">{APP_NAME}</span>
        <ModeToggle />
      </header>
      <main className="bg-muted/40 flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Phase 0 — Setup complete</CardTitle>
            <CardDescription>
              Vite + React + TypeScript + Tailwind 4 + shadcn/ui running on port 3000 with API proxy
              ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/login">Go to login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Create account</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
