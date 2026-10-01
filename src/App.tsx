import { useEffect } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { RouterProvider } from 'react-router'

import { restoreSession } from '@/auth/session'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query-client'
import { router } from '@/routes/router'

export default function App() {
  useEffect(() => {
    void restoreSession()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ErrorBoundary>
          <TooltipProvider>
            <RouterProvider router={router} />
            <Toaster position="bottom-right" richColors />
          </TooltipProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
