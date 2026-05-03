import { useZatcaOnboardingStatus, useRequestCcsid, useUpgradeToPcsid } from '@erp/api-client'
import { ZatcaOnboardingWizard, LoadingSpinner, PageHeader } from '@erp/ui'
import { useAuthStore } from '../../store/auth'

export function OnboardingPage() {
  const { organization } = useAuthStore()
  const branchId = organization?.id ?? ''

  const { data: onboarding, isLoading, isError } = useZatcaOnboardingStatus(branchId)
  const requestCcsid = useRequestCcsid(branchId)
  const upgradeToPcsid = useUpgradeToPcsid(branchId)

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError || !onboarding) return <div className="p-6 text-red-600">Failed to load onboarding status.</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <PageHeader
        title="ZATCA Onboarding"
        breadcrumbs={[{ label: 'Compliance' }, { label: 'ZATCA' }, { label: 'Onboarding' }]}
      />
      <p className="text-sm text-gray-500 mb-6">
        Register this branch with the ZATCA e-invoicing network to enable invoice submission.
      </p>
      <ZatcaOnboardingWizard
        status={onboarding.status}
        onRequestCcsid={() => requestCcsid.mutate()}
        onUpgradeToPcsid={() => upgradeToPcsid.mutate()}
        isLoading={requestCcsid.isPending || upgradeToPcsid.isPending}
        lastError={onboarding.last_error}
      />
    </div>
  )
}
