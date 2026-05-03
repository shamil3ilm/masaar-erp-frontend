import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ZatcaOnboardingWizard } from './ZatcaOnboardingWizard'

const defaultProps = {
  status: 'not_started' as const,
  onRequestCcsid: vi.fn(),
  onUpgradeToPcsid: vi.fn(),
  isLoading: false,
}

describe('ZatcaOnboardingWizard', () => {
  it('shows step 1 active when status is not_started', () => {
    render(<ZatcaOnboardingWizard {...defaultProps} />)
    expect(screen.getByText('Request Compliance Certificate (CCSID)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request ccsid/i })).toBeInTheDocument()
  })

  it('shows upgrade button when status is ccsid_requested', () => {
    render(<ZatcaOnboardingWizard {...defaultProps} status="ccsid_requested" />)
    expect(screen.getByRole('button', { name: /upgrade to production/i })).toBeInTheDocument()
  })

  it('shows completed state when pcsid_active', () => {
    render(<ZatcaOnboardingWizard {...defaultProps} status="pcsid_active" />)
    expect(screen.getByText('Onboarding Complete')).toBeInTheDocument()
  })

  it('calls onRequestCcsid when button clicked', async () => {
    const onRequestCcsid = vi.fn()
    render(<ZatcaOnboardingWizard {...defaultProps} onRequestCcsid={onRequestCcsid} />)
    await userEvent.click(screen.getByRole('button', { name: /request ccsid/i }))
    expect(onRequestCcsid).toHaveBeenCalledOnce()
  })
})
