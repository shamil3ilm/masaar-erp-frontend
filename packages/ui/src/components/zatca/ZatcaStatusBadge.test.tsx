import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ZatcaStatusBadge } from './ZatcaStatusBadge'

describe('ZatcaStatusBadge', () => {
  it('renders "Cleared" for cleared status', () => {
    render(<ZatcaStatusBadge status="cleared" />)
    expect(screen.getByText('Cleared')).toBeInTheDocument()
  })

  it('renders "Rejected" with red class for rejected status', () => {
    render(<ZatcaStatusBadge status="rejected" />)
    const badge = screen.getByText('Rejected')
    expect(badge.className).toContain('red')
  })

  it('renders "Pending" for pending status', () => {
    render(<ZatcaStatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders "Submitted" for submitted status', () => {
    render(<ZatcaStatusBadge status="submitted" />)
    expect(screen.getByText('Submitted')).toBeInTheDocument()
  })

  it('renders "Reported" for reported status', () => {
    render(<ZatcaStatusBadge status="reported" />)
    expect(screen.getByText('Reported')).toBeInTheDocument()
  })
})
