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
  user: User
}

interface LoginChallengeData {
  requires_2fa: true
  challenge_token: string
}

type LoginResponseData = LoginSuccessData | LoginChallengeData

const inputCls = 'auth-input w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none placeholder:text-gray-400'

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const [challengeToken, setChallengeToken] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const verify2fa = useVerify2fa()

  function handleAuthSuccess(data: LoginSuccessData) {
    const org = data.user.organization ?? null
    setAuth(data.token, data.user, org ? [org] : [], org)
    void navigate({ to: '/app/dashboard' })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    try {
      const { data } = await getApiClient().post<ApiResponse<LoginResponseData>>('/auth/login', { email, password })
      const result = data.data
      if ('requires_2fa' in result && result.requires_2fa) {
        setChallengeToken(result.challenge_token)
      } else {
        handleAuthSuccess(result as LoginSuccessData)
      }
    } catch {
      setError('Invalid email or password. Please try again.')
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

  // ── 2FA ───────────────────────────────────────────────────────────────────
  if (challengeToken) {
    return (
      <AuthLayout>
        <div className="auth-form-header">
          <div className="auth-2fa-icon">🔐</div>
          <h1>Two-step verification</h1>
          <p>Enter the 6-digit code from your authenticator app.</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handle2fa} noValidate className="auth-form-body">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000 000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            className="auth-otp-input"
          />
          <button
            type="submit"
            disabled={verify2fa.isPending || otpCode.length !== 6}
            className="auth-btn"
          >
            {verify2fa.isPending ? 'Verifying…' : 'Verify code'}
          </button>
        </form>

        <button onClick={() => setChallengeToken(null)} className="auth-back-link">
          ← Use a different account
        </button>
      </AuthLayout>
    )
  }

  // ── Sign in ───────────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      <div className="auth-form-header">
        <h1>Welcome back</h1>
        <p>
          No account?{' '}
          <Link to="/register" className="auth-link">Create one free</Link>
        </p>
      </div>

      {error && (
        <div className="auth-error-alert">
          <span>⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleLogin} noValidate className="auth-form-body">
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            className={inputCls}
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" className="auth-link auth-link-sm">Forgot password?</Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="rounded-xl border-gray-200 py-3"
          />
        </div>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading
            ? <><span className="auth-spinner" /> Signing in…</>
            : 'Sign in'}
        </button>
      </form>

      <div className="auth-divider"><span>Trusted by 500+ companies</span></div>

      <div className="auth-trust-row">
        <span>🔒 SSL encrypted</span>
        <span>🛡 SOC 2 compliant</span>
        <span>🌍 GCC & India</span>
      </div>
    </AuthLayout>
  )
}
