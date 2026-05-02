export type ZatcaOnboardingStatus =
  | 'not_started'
  | 'csr_generated'
  | 'ccsid_requested'
  | 'compliance_check_passed'
  | 'pcsid_active'
  | 'failed'

export interface ZatcaDeviceOnboarding {
  branch_id: string
  branch_name: string
  status: ZatcaOnboardingStatus
  ccsid_expires_at: string | null
  pcsid_issued_at: string | null
  last_error: string | null
}

export type ZatcaInvoiceStatus = 'pending' | 'submitted' | 'cleared' | 'rejected'

export interface ZatcaInvoice {
  id: string
  invoice_number: string
  invoice_type: 'standard' | 'simplified'
  buyer_name: string
  buyer_vat: string | null
  total_amount: number
  vat_amount: number
  currency: string
  status: ZatcaInvoiceStatus
  zatca_uuid: string | null
  zatca_hash: string | null
  rejection_reason: string | null
  submitted_at: string | null
  cleared_at: string | null
  created_at: string
}

export interface ZatcaInvoiceDetail extends ZatcaInvoice {
  xml_content: string
  line_items: ZatcaLineItem[]
}

export interface ZatcaLineItem {
  description: string
  quantity: number
  unit_price: number
  vat_rate: number
  vat_amount: number
  total: number
}

export interface ZatcaComplianceReport {
  period_start: string
  period_end: string
  total_submitted: number
  total_cleared: number
  total_rejected: number
  total_pending: number
  clearance_rate: number
  rejection_rate: number
  last_submission_at: string | null
}

export interface CreateZatcaInvoicePayload {
  buyer_name: string
  buyer_vat: string
  invoice_type: 'standard' | 'simplified'
  currency: string
  line_items: {
    description: string
    quantity: number
    unit_price: number
    vat_rate: number
  }[]
}
