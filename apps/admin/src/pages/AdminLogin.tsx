import { useState, type FormEvent } from 'react'
import { AuthLayout, Logo, Input, PasswordInput, Button, FormField, Alert } from '@masaar/ui'
import {
  getApiClient, isTwoFactorChallenge, parseApiError,
  type AuthTokenResponse, type LoginResult,
} from '@masaar/api-client'
import type { ApiResponse } from '@masaar/types'

interface AdminLoginProps {
  onLogin: (token: string) => void
}

function AdminBrandPanel() {
  return (
    <>
      <div className="auth-left-logo">
        <Logo size={44} showName nameClassName="font-semibold text-white tracking-tight" />
      </div>

      <div className="mt-auto space-y-3">
        <p className="text-2xl font-semibold text-white leading-snug">
          Masaar<br />Admin Console
        </p>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(148,163,184,0.9)' }}>
          Manage organizations, users, and platform settings.
        </p>
      </div>
    </>
  )
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [challengeToken, setChallengeToken] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(request: () => Promise<void>, fallback: string) {
    setError(null)
    setLoading(true)
    try {
      await request()
    } catch (err) {
      const { status, message } = parseApiError(err)
      setError(status ? message : fallback)
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void submit(async () => {
      const res = await getApiClient().post<ApiResponse<LoginResult>>('/auth/login', { email, password })
      const result = res.data.data
      // With 2FA on, login returns a challenge instead of a token.
      if (isTwoFactorChallenge(result)) {
        setChallengeToken(result.challenge_token)
      } else {
        onLogin(result.token)
      }
    }, 'Login failed. Please check your credentials.')
  }

  function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!challengeToken) return
    void submit(async () => {
      const res = await getApiClient().post<ApiResponse<AuthTokenResponse>>('/auth/2fa/verify', {
        challenge_token: challengeToken,
        code,
      })
      onLogin(res.data.data.token)
    }, 'Verification failed. Please try again.')
  }

  return (
    <AuthLayout leftPanel={<AdminBrandPanel />}>
      <div className="auth-right-logo">
        <Logo size={40} showName />
      </div>

      <div className="auth-form-header">
        <h1>{challengeToken ? 'Two-step verification' : 'Admin sign in'}</h1>
        <p>
          {challengeToken
            ? 'Enter the code from your authenticator app, or a recovery code.'
            : 'Restricted access — authorized staff only.'}
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-5">{error}</Alert>
      )}

      {challengeToken ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <FormField label="Verification code" htmlFor="code">
            <Input
              id="code"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              placeholder="000000"
            />
          </FormField>
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Verify
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => { setChallengeToken(null); setCode(''); setError(null) }}
          >
            Use a different account
          </Button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <FormField label="Email address" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@masaar.app"
            />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <PasswordInput
              id="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormField>
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Sign in
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
