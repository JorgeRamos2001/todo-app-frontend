import { render, screen } from '@testing-library/react'

import { ErrorState } from '@/components/error-state'

describe('ErrorState', () => {
  it('renders the title and description', () => {
    render(<ErrorState title="Something went wrong" description="Please try again" />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Please try again')).toBeInTheDocument()
  })

  it('renders without a description', () => {
    render(<ErrorState title="Request failed" />)

    expect(screen.getByText('Request failed')).toBeInTheDocument()
  })
})
