import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/error-state'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
          <ErrorState
            title="Something went wrong"
            description="An unexpected error occurred. Reload the page to continue."
            action={<Button onClick={() => window.location.reload()}>Reload</Button>}
          />
        </div>
      )
    }
    return this.props.children
  }
}
