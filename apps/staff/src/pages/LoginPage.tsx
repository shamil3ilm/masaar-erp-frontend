import { useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useAuthStore } from '../store/auth'
import { isTwoFactorChallenge, useLogin, useVerify2fa, type AuthTokenResponse } from '@masaar/api-client'
import { AuthLayout } from '../components/AuthLayout'
import { Input, PasswordInput, Alert, FormField, Button, Lock } from '@masaar/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { verified?: string }
  const justVerified = search.verified === '1'
  const { setAuth } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const [challengeToken, setChallengeToken] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const login = useLogin()
  const verify2fa = useVerify2fa()

  function handleAuthSuccess(data: AuthTokenResponse) {
    const org = data.user.organization ?? null
    setAuth(data.token, data.user, org ? [org] : [], org)
    void navigate({ to: '/app/dashboard' })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setError('')
    try {
      const result = await login.mutateAsync({ email, password })
      if (isTwoFactorChallenge(result)) {
        setChallengeToken(result.challenge_token)
      } else {
        handleAuthSuccess(result)
      }
    } catch {
      setError('Invalid email or password. Please try again.')
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
          <div className="auth-2fa-icon">
            <span className="inline-flex w-12 h-12 items-center justify-center rounded-xl bg-brand-subtle">
              <Lock size={22} className="text-brand-dark" />
            </span>
          </div>
          <h1>Two-step verification</h1>
          <p>Enter the 6-digit code from your authenticator app.</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-5">{error}</Alert>
        )}

        <form onSubmit={handle2fa} noValidate className="space-y-4">
          <FormField label="Verification code">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000 000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-[0.4em] font-mono h-14"
            />
          </FormField>
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={verify2fa.isPending || otpCode.length !== 6}
            loading={verify2fa.isPending}
          >
            Verify code
          </Button>
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

      {justVerified && (
        <Alert variant="success" className="mb-5">Email verified — you can sign in now.</Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-5">{error}</Alert>
      )}

      <form onSubmit={handleLogin} noValidate className="space-y-4">
        <FormField label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          labelRight={
            <Link to="/forgot-password" className="auth-link auth-link-sm">Forgot password?</Link>
          }
        >
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </FormField>

        <Button type="submit" fullWidth size="lg" loading={login.isPending}>
          Sign in
        </Button>
      </form>

      <div className="auth-divider"><span>Trusted by 500+ companies across GCC &amp; India</span></div>

      <div className="auth-trust-row">
        <span className="auth-trust-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          256-bit encrypted
        </span>
        <span className="auth-trust-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          ZATCA certified
        </span>
        <span className="auth-trust-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          GCC &amp; India
        </span>
      </div>
    </AuthLayout>
  )
}
