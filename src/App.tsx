import { useEffect } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { RouterProvider } from 'react-router'

import { restoreSession } from '@/auth/session'
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
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" richColors />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
