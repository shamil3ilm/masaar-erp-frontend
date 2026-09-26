import { useState, type FormEvent } from 'react'
import { AuthLayout, Logo, Input, PasswordInput, Button, FormField, Alert } from '@masaar/ui'
import { isTwoFactorChallenge, parseApiError, useLogin, useVerify2fa } from '@masaar/api-client'
import type { AuthTokenResponse } from '@masaar/api-client'

interface AdminLoginProps {
  onLogin: (token: string) => void
}

/** Refused for want of the privilege, rather than by the server. */
class NotAnAdministrator extends Error {}

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
  const login = useLogin()
  const verify2fa = useVerify2fa()

  /**
   * The console is for platform administrators, and the API refuses every
   * admin call from anyone else. Signing an ordinary user in anyway gave them
   * a console that answers 403 to everything, so the credential is checked
   * for the privilege the console is built around before the session starts.
   */
  function admitSuperAdmin(result: AuthTokenResponse) {
    if (result.user?.is_super_admin !== true) {
      throw new NotAnAdministrator('This console is for platform administrators.')
    }

    onLogin(result.token)
  }

  async function submit(request: () => Promise<void>, fallback: string) {
    setError(null)
    setLoading(true)
    try {
      await request()
    } catch (err) {
      // Only this screen's own refusal carries a message fit to show. Anything
      // else goes through parseApiError, so a transport failure cannot put a
      // host name or a driver error in front of someone signing in.
      if (err instanceof NotAnAdministrator) {
        setError(err.message)
        return
      }

      const { status, message } = parseApiError(err)
      setError(status ? message : fallback)
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void submit(async () => {
      const result = await login.mutateAsync({ email, password })
      // With 2FA on, login returns a challenge instead of a token.
      if (isTwoFactorChallenge(result)) {
        setChallengeToken(result.challenge_token)
      } else {
        admitSuperAdmin(result)
      }
    }, 'Login failed. Please check your credentials.')
  }

  function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!challengeToken) return
    void submit(async () => {
      const result = await verify2fa.mutateAsync({ challenge_token: challengeToken, code })
      admitSuperAdmin(result)
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
