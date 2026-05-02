import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with accessible label', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('applies lg size class', () => {
    render(<LoadingSpinner size="lg" />)
    const el = screen.getByRole('status')
    expect(el.className).toContain('h-12')
  })

  it('applies sm size class', () => {
    render(<LoadingSpinner size="sm" />)
    const el = screen.getByRole('status')
    expect(el.className).toContain('h-4')
  })
})
