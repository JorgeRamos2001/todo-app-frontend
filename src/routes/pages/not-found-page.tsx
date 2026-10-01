import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/error-state'

export function NotFoundPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="404 — Page not found"
        description="The page you are looking for does not exist or was moved."
        action={
          <Button asChild>
            <Link to="/">Back home</Link>
          </Button>
        }
      />
    </main>
  )
}
