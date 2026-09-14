import { useMutation, useQuery } from '@tanstack/react-query'
import type { ApiResponse, BranchSummary, User } from '@masaar/types'
import { getApiClient } from './axios'

export interface AuthTokenResponse {
  token: string
  token_type: string
  expires_in: number
  // The user's organization (nullable) is carried on `user.organization`.
  user: User
}

/** What `/auth/login` returns instead of a token when the user has 2FA enabled. */
export interface TwoFactorChallenge {
  requires_2fa: true
  challenge_token: string
}

export type LoginResult = AuthTokenResponse | TwoFactorChallenge

export function isTwoFactorChallenge(result: LoginResult): result is TwoFactorChallenge {
  return 'requires_2fa' in result && result.requires_2fa === true
}

export interface MeResponse {
  user: User
  permissions: unknown[]
  default_branch: BranchSummary | null
}

export const authKeys = {
  me: ['auth', 'me'] as const,
}

/** The signed-in user with branches loaded; the login payload carries no branches. */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<MeResponse>>('/auth/me')
      return data.data
    },
  })
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  organization_name: string
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      getApiClient()
        .post<ApiResponse<AuthTokenResponse>>('/auth/register', payload)
        .then((r) => r.data.data),
  })
}

export interface ForgotPasswordPayload {
  email: string
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      getApiClient()
        .post<ApiResponse<null>>('/auth/forgot-password', payload)
        .then((r) => r.data),
  })
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      getApiClient()
        .post<ApiResponse<null>>('/auth/reset-password', payload)
        .then((r) => r.data),
  })
}

export interface VerifyEmailPayload {
  email: string
  code: string
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) =>
      getApiClient()
        .post<ApiResponse<null>>('/auth/email/verify', payload)
        .then((r) => r.data),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      getApiClient()
        .post<ApiResponse<null>>('/auth/email/resend', payload)
        .then((r) => r.data),
  })
}

export interface Verify2faPayload {
  challenge_token: string
  code: string
}

export function useVerify2fa() {
  return useMutation({
    mutationFn: (payload: Verify2faPayload) =>
      getApiClient()
        .post<ApiResponse<AuthTokenResponse>>('/auth/2fa/verify', payload)
        .then((r) => r.data.data),
  })
}
