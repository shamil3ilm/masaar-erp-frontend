import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../store/auth'
import { getApiClient, useVerify2fa } from '@erp/api-client'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '@erp/ui'
import type { ApiResponse, User } from '@erp/types'

interface LoginSuccessData {
  token: string
  token_type: string
  expires_in: number
  // The user's organization (nullable for super-admins) is carried on user.organization.
  user: User
}

interface LoginChallengeData {
  requires_2fa: true
  challenge_token: string
}

type LoginResponseData = LoginSuccessData | LoginChallengeData

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [challengeToken, setChallengeToken] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const verify2fa = useVerify2fa()

  function handleAuthSuccess(data: LoginSuccessData) {
    // Backend models one organization per user (null for super-admins).
    const org = data.user.organization ?? null
    setAuth(data.token, data.user, org ? [org] : [], org)
    void navigate({ to: '/app/dashboard' })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await getApiClient().post<ApiResponse<LoginResponseData>>('/auth/login', {
        email,
        password,
      })
      const result = data.data
      if ('requires_2fa' in result && result.requires_2fa) {
        setChallengeToken(result.challenge_token)
      } else {
        handleAuthSuccess(result as LoginSuccessData)
      }
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  async function handle2fa(e: React.FormEvent) {
    e.preventDefault()
    if (!challengeToken) return
    setError('')
    try {
      const result = await verify2fa.mutateAsync({ challenge_token: challengeToken, code: otpCode })
      handleAuthSuccess(result)
    } catch {
      setError('Invalid verification code.')
    }
  }

  // ── 2FA challenge ─────────────────────────────────────────────────────────
  if (challengeToken) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Two-factor auth</h1>
        <p className="text-sm text-gray-500 mb-8">
          Enter the 6-digit code from your authenticator app.
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <form onSubmit={handle2fa} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000 000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-center text-xl tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={verify2fa.isPending || otpCode.length !== 6}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {verify2fa.isPending ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <button
          onClick={() => setChallengeToken(null)}
          className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600"
        >
          ← Use a different account
        </button>
      </AuthLayout>
    )
  }

  // ── Sign in ───────────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-8">
        No account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Create one free
        </Link>
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
