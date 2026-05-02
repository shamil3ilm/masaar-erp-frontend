import { http, HttpResponse } from 'msw'
import type { ZatcaDeviceOnboarding, ZatcaInvoice, ZatcaComplianceReport } from '@erp/types'

const BASE = '/api/v1'

export const zatcaMockHandlers = [
  http.get(`${BASE}/compliance/branches/:branchId/onboarding`, ({ params }) => {
    const onboarding: ZatcaDeviceOnboarding = {
      branch_id: params.branchId as string,
      branch_name: 'Main Branch',
      status: 'not_started',
      ccsid_expires_at: null,
      pcsid_issued_at: null,
      last_error: null,
    }
    return HttpResponse.json({ success: true, data: onboarding, meta: {} })
  }),

  http.post(`${BASE}/compliance/branches/:branchId/ccsid`, ({ params }) => {
    const onboarding: ZatcaDeviceOnboarding = {
      branch_id: params.branchId as string,
      branch_name: 'Main Branch',
      status: 'ccsid_requested',
      ccsid_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      pcsid_issued_at: null,
      last_error: null,
    }
    return HttpResponse.json({ success: true, data: onboarding, meta: {} })
  }),

  http.post(`${BASE}/compliance/branches/:branchId/pcsid`, ({ params }) => {
    const onboarding: ZatcaDeviceOnboarding = {
      branch_id: params.branchId as string,
      branch_name: 'Main Branch',
      status: 'pcsid_active',
      ccsid_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      pcsid_issued_at: new Date().toISOString(),
      last_error: null,
    }
    return HttpResponse.json({ success: true, data: onboarding, meta: {} })
  }),

  http.get(`${BASE}/compliance/zatca/invoices`, () => {
    const invoices: ZatcaInvoice[] = [
      {
        id: '1',
        invoice_number: 'INV-001',
        invoice_type: 'standard',
        buyer_name: 'Acme Corp',
        buyer_vat: '300000000000003',
        total_amount: 1150,
        vat_amount: 150,
        currency: 'SAR',
        status: 'cleared',
        zatca_uuid: 'abc-uuid',
        zatca_hash: 'abc-hash',
        rejection_reason: null,
        submitted_at: new Date().toISOString(),
        cleared_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]
    return HttpResponse.json({
      success: true,
      data: invoices,
      meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
    })
  }),

  http.get(`${BASE}/compliance/zatca/report`, () => {
    const report: ZatcaComplianceReport = {
      period_start: '2026-05-01',
      period_end: '2026-05-31',
      total_submitted: 42,
      total_cleared: 38,
      total_rejected: 2,
      total_pending: 2,
      clearance_rate: 90.5,
      rejection_rate: 4.8,
      last_submission_at: new Date().toISOString(),
    }
    return HttpResponse.json({ success: true, data: report, meta: {} })
  }),
]
