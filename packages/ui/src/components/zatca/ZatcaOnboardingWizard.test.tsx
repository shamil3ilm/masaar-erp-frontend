import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ZatcaOnboardingWizard } from './ZatcaOnboardingWizard'

const defaultProps = {
  status: null as null,
  onRequestCcsid: vi.fn(),
  onComplianceCheck: vi.fn(),
  onUpgradeToPcsid: vi.fn(),
  isLoading: false,
}

describe('ZatcaOnboardingWizard', () => {
  it('shows step 1 active and OTP/CSR form when status is null', () => {
    render(<ZatcaOnboardingWizard {...defaultProps} />)
    expect(screen.getByText('Request Compliance Certificate (CCSID)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter otp/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request ccsid/i })).toBeInTheDocument()
  })

  it('shows compliance check button when status is ccsid_issued', () => {
    render(<ZatcaOnboardingWizard {...defaultProps} status="ccsid_issued" />)
    expect(screen.getByRole('button', { name: /run compliance check/i })).toBeInTheDocument()
  })

  it('shows upgrade button when status is compliance_checked', () => {
    render(<ZatcaOnboardingWizard {...defaultProps} status="compliance_checked" />)
    expect(screen.getByRole('button', { name: /upgrade to production/i })).toBeInTheDocument()
  })

  it('shows completed state when pcsid_issued', () => {
    render(<ZatcaOnboardingWizard {...defaultProps} status="pcsid_issued" />)
    expect(screen.getByText('Onboarding Complete')).toBeInTheDocument()
  })

  it('shows CSR parse error when invalid JSON is submitted', async () => {
    render(<ZatcaOnboardingWizard {...defaultProps} />)
    await userEvent.type(screen.getByPlaceholderText(/enter otp/i), 'my-otp')
    fireEvent.change(screen.getByPlaceholderText(/csr/i), { target: { value: 'not-valid-json' } })
    await userEvent.click(screen.getByRole('button', { name: /request ccsid/i }))
    expect(screen.getByText(/must be valid json/i)).toBeInTheDocument()
  })

  it('calls onRequestCcsid with otp and parsed csr when form is valid', async () => {
    const onRequestCcsid = vi.fn()
    render(<ZatcaOnboardingWizard {...defaultProps} onRequestCcsid={onRequestCcsid} />)
    await userEvent.type(screen.getByPlaceholderText(/enter otp/i), 'my-otp')
    fireEvent.change(screen.getByPlaceholderText(/csr/i), {
      target: { value: '{"key":"val"}' },
    })
    await userEvent.click(screen.getByRole('button', { name: /request ccsid/i }))
    expect(onRequestCcsid).toHaveBeenCalledWith({ otp: 'my-otp', csr: { key: 'val' } })
  })

  it('calls onComplianceCheck when button clicked at step 2', async () => {
    const onComplianceCheck = vi.fn()
    render(<ZatcaOnboardingWizard {...defaultProps} status="ccsid_issued" onComplianceCheck={onComplianceCheck} />)
    await userEvent.click(screen.getByRole('button', { name: /run compliance check/i }))
    expect(onComplianceCheck).toHaveBeenCalledOnce()
  })
})
