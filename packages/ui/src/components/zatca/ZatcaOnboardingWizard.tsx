import { cn } from '../../lib/utils'
import type { ZatcaOnboardingStatus } from '@erp/types'

interface ZatcaOnboardingWizardProps {
  status: ZatcaOnboardingStatus
  onRequestCcsid: () => void
  onUpgradeToPcsid: () => void
  isLoading: boolean
  lastError?: string | null
}

const steps = [
  { id: 'ccsid', label: 'Request Compliance Certificate (CCSID)' },
  { id: 'compliance_check', label: 'Run Compliance Check' },
  { id: 'pcsid', label: 'Upgrade to Production (PCSID)' },
]

function getActiveStep(status: ZatcaOnboardingStatus): number {
  switch (status) {
    case 'not_started':
    case 'csr_generated':
      return 0
    case 'ccsid_requested':
    case 'compliance_check_passed':
      return 2
    case 'pcsid_active':
      return 3
    default:
      return 0
  }
}

export function ZatcaOnboardingWizard({
  status,
  onRequestCcsid,
  onUpgradeToPcsid,
  isLoading,
  lastError,
}: ZatcaOnboardingWizardProps) {
  const activeStep = getActiveStep(status)

  if (status === 'pcsid_active') {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <div className="text-green-600 text-4xl mb-2">✓</div>
        <h3 className="text-lg font-semibold text-green-900">Onboarding Complete</h3>
        <p className="text-sm text-green-700 mt-1">This branch is active on the ZATCA production network.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">ZATCA Device Onboarding</h3>
      <ol className="space-y-4 mb-6">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-start gap-3">
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
      {lastError && (
        <div className="mb-4 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {lastError}
        </div>
      )}
      {activeStep === 0 && (
        <button
          onClick={onRequestCcsid}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Requesting...' : 'Request CCSID'}
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
