import { useState } from 'react'
import { cn } from '../../lib/utils'
import type { ZatcaOnboardingStatus } from '@erp/types'

export interface RequestCcsidPayload {
  otp: string
  csr: Record<string, unknown>
}

interface ZatcaOnboardingWizardProps {
  status: ZatcaOnboardingStatus | null
  onRequestCcsid: (payload: RequestCcsidPayload) => void
  onComplianceCheck: () => void
  onUpgradeToPcsid: () => void
  isLoading: boolean
}

const STEPS = [
  { label: 'Request Compliance Certificate (CCSID)' },
  { label: 'Run Compliance Check' },
  { label: 'Upgrade to Production (PCSID)' },
]

function getActiveStep(status: ZatcaOnboardingStatus | null): number {
  switch (status) {
    case null: return 0
    case 'ccsid_issued': return 1
    case 'compliance_checked': return 2
    case 'pcsid_issued': return 3
  }
}

export function ZatcaOnboardingWizard({
  status,
  onRequestCcsid,
  onComplianceCheck,
  onUpgradeToPcsid,
  isLoading,
}: ZatcaOnboardingWizardProps) {
  const [otp, setOtp] = useState('')
  const [csrJson, setCsrJson] = useState('')
  const [csrError, setCsrError] = useState<string | null>(null)
  const activeStep = getActiveStep(status)

  if (status === 'pcsid_issued') {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <div className="text-green-600 text-4xl mb-2">✓</div>
        <h3 className="text-lg font-semibold text-green-900">Onboarding Complete</h3>
        <p className="text-sm text-green-700 mt-1">This branch is active on the ZATCA production network.</p>
      </div>
    )
  }

  function handleRequestCcsid() {
    setCsrError(null)
    let csr: Record<string, unknown>
    try {
      csr = JSON.parse(csrJson) as Record<string, unknown>
    } catch {
      setCsrError('CSR must be valid JSON')
      return
    }
    onRequestCcsid({ otp, csr })
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">ZATCA Device Onboarding</h3>
      <ol className="space-y-4 mb-6">
        {STEPS.map((step, index) => (
          <li key={step.label} className="flex items-start gap-3">
            <div className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
              index < activeStep ? 'bg-green-500 text-white' :
              index === activeStep ? 'bg-blue-600 text-white' :
              'bg-gray-200 text-gray-500',
            )}>
              {index < activeStep ? '✓' : index + 1}
            </div>
            <span className={cn(
              'text-sm pt-1',
              index === activeStep ? 'font-medium text-gray-900' : 'text-gray-500',
            )}>
              {step.label}
            </span>
          </li>
        ))}
      </ol>

      {activeStep === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP from ZATCA portal"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CSR (JSON)</label>
            <textarea
              value={csrJson}
              onChange={(e) => setCsrJson(e.target.value)}
              placeholder='{"csr": "..."}'
              rows={4}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono"
            />
            {csrError && <p className="text-xs text-red-600 mt-1">{csrError}</p>}
          </div>
          <button
            onClick={handleRequestCcsid}
            disabled={isLoading || !otp}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Requesting...' : 'Request CCSID'}
          </button>
        </div>
      )}

      {activeStep === 1 && (
        <button
          onClick={onComplianceCheck}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running...' : 'Run Compliance Check'}
        </button>
      )}

      {activeStep === 2 && (
        <button
          onClick={onUpgradeToPcsid}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Upgrading...' : 'Upgrade to Production (PCSID)'}
        </button>
      )}
    </div>
  )
}
