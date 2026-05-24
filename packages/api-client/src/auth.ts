import { useMutation } from '@tanstack/react-query'
import type { ApiResponse, User } from '@erp/types'
import { getApiClient } from './axios'

interface AuthTokenResponse {
  token: string
  token_type: string
  expires_in: number
  // The user's organization (nullable) is carried on `user.organization`.
  user: User
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
  token: string
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
