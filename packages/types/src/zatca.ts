export type ZatcaOnboardingStatus = 'ccsid_issued' | 'compliance_checked' | 'pcsid_issued'

export interface ZatcaDeviceOnboarding {
  zatca_branch_id: string
  zatca_onboarding_status: ZatcaOnboardingStatus | null
  zatca_certificate_expires_at: string | null
  compliance_result?: unknown
}

// Invoice compliance status — used by ZatcaStatusBadge and Sales invoices
export type ZatcaComplianceStatus = 'pending' | 'submitted' | 'cleared' | 'reported' | 'rejected'
