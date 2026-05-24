import { useZatcaOnboardingStatus, useRequestCcsid, useComplianceCheck, useUpgradeToPcsid } from '@erp/api-client'
import type { RequestCcsidPayload } from '@erp/api-client'
import { ZatcaOnboardingWizard, LoadingSpinner, PageHeader } from '@erp/ui'
import { useAuthStore } from '../../store/auth'

export function OnboardingPage() {
  const { organization } = useAuthStore()
  const branchId = organization?.id ?? ''

  const { data: onboarding, isLoading, isError } = useZatcaOnboardingStatus(branchId)
  const requestCcsid = useRequestCcsid(branchId)
  const complianceCheck = useComplianceCheck(branchId)
  const upgradeToPcsid = useUpgradeToPcsid(branchId)

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError || !onboarding) return <div className="p-6 text-danger">Failed to load onboarding status.</div>

  function handleRequestCcsid(payload: RequestCcsidPayload) {
    requestCcsid.mutate(payload)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="ZATCA Onboarding"
        description="Register this branch with the ZATCA e-invoicing network to enable invoice submission."
        breadcrumbs={[{ label: 'Compliance' }, { label: 'ZATCA' }, { label: 'Onboarding' }]}
      />
      <ZatcaOnboardingWizard
        status={onboarding.zatca_onboarding_status}
        onRequestCcsid={handleRequestCcsid}
        onComplianceCheck={() => complianceCheck.mutate()}
        onUpgradeToPcsid={() => upgradeToPcsid.mutate()}
        isLoading={requestCcsid.isPending || complianceCheck.isPending || upgradeToPcsid.isPending}
      />
    </div>
  )
}
