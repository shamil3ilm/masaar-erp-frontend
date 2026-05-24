import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ZatcaDeviceOnboarding, ApiResponse } from '@erp/types'
import { getApiClient } from './axios'

export const zatcaKeys = {
  onboarding: (branchId: string) => ['zatca', 'onboarding', branchId] as const,
}

export function useZatcaOnboardingStatus(branchId: string) {
  return useQuery({
    queryKey: zatcaKeys.onboarding(branchId),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<ZatcaDeviceOnboarding>>(
        `/compliance/branches/${branchId}/onboarding/status`,
      )
      return data.data
    },
    enabled: !!branchId,
  })
}

export interface RequestCcsidPayload {
  otp: string
  csr: Record<string, unknown>
}

export function useRequestCcsid(branchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: RequestCcsidPayload) => {
      const { data } = await getApiClient().post<ApiResponse<ZatcaDeviceOnboarding>>(
        `/compliance/branches/${branchId}/onboarding/ccsid`,
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: zatcaKeys.onboarding(branchId) }),
  })
}

export function useComplianceCheck(branchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<ZatcaDeviceOnboarding>>(
        `/compliance/branches/${branchId}/onboarding/compliance-check`,
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
        `/compliance/branches/${branchId}/onboarding/pcsid`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: zatcaKeys.onboarding(branchId) }),
  })
}
