import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ZatcaDeviceOnboarding,
  ZatcaInvoice,
  ZatcaInvoiceDetail,
  ZatcaComplianceReport,
  CreateZatcaInvoicePayload,
  ApiResponse,
  PaginatedResponse,
} from '@erp/types'
import { getApiClient } from './axios'

export const zatcaKeys = {
  onboarding: (branchId: string) => ['zatca', 'onboarding', branchId] as const,
  invoices: (filters: Record<string, unknown>) => ['zatca', 'invoices', filters] as const,
  invoice: (id: string) => ['zatca', 'invoice', id] as const,
  report: (dateRange: { start: string; end: string }) => ['zatca', 'report', dateRange] as const,
}

export function useZatcaOnboardingStatus(branchId: string) {
  return useQuery({
    queryKey: zatcaKeys.onboarding(branchId),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<ZatcaDeviceOnboarding>>(
        `/compliance/branches/${branchId}/onboarding`,
      )
      return data.data
    },
  })
}

export function useRequestCcsid(branchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<ZatcaDeviceOnboarding>>(
        `/compliance/branches/${branchId}/ccsid`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: zatcaKeys.onboarding(branchId) }),
  })
}

export function useUpgradeToPcsid(branchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<ZatcaDeviceOnboarding>>(
        `/compliance/branches/${branchId}/pcsid`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: zatcaKeys.onboarding(branchId) }),
  })
}

export interface ZatcaInvoiceFilters {
  page?: number
  per_page?: number
  status?: string
  date_from?: string
  date_to?: string
}

export function useZatcaInvoices(filters: ZatcaInvoiceFilters = {}) {
  return useQuery({
    queryKey: zatcaKeys.invoices(filters as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await getApiClient().get<PaginatedResponse<ZatcaInvoice>>(
        '/compliance/zatca/invoices',
        { params: filters },
      )
      return data
    },
  })
}

export function useZatcaInvoice(invoiceId: string) {
  return useQuery({
    queryKey: zatcaKeys.invoice(invoiceId),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<ZatcaInvoiceDetail>>(
        `/compliance/zatca/invoices/${invoiceId}`,
      )
      return data.data
    },
  })
}

export function useCreateZatcaInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateZatcaInvoicePayload) => {
      const { data } = await getApiClient().post<ApiResponse<ZatcaInvoice>>(
        '/compliance/zatca/invoices',
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zatca', 'invoices'] }),
  })
}

export function useSubmitInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data } = await getApiClient().post<ApiResponse<ZatcaInvoice>>(
        `/compliance/zatca/invoices/${invoiceId}/submit`,
      )
      return data.data
    },
    onSuccess: (_, invoiceId) => {
      qc.invalidateQueries({ queryKey: ['zatca', 'invoices'] })
      qc.invalidateQueries({ queryKey: zatcaKeys.invoice(invoiceId) })
    },
  })
}

export function useRetryInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data } = await getApiClient().post<ApiResponse<ZatcaInvoice>>(
        `/compliance/zatca/invoices/${invoiceId}/retry`,
      )
      return data.data
    },
    onSuccess: (_, invoiceId) => {
      qc.invalidateQueries({ queryKey: ['zatca', 'invoices'] })
      qc.invalidateQueries({ queryKey: zatcaKeys.invoice(invoiceId) })
    },
  })
}

export function useComplianceReport(dateRange: { start: string; end: string }) {
  return useQuery({
    queryKey: zatcaKeys.report(dateRange),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<ZatcaComplianceReport>>(
        '/compliance/zatca/report',
        { params: dateRange },
      )
      return data.data
    },
  })
}
