import { useState } from 'react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useVerifyEmail, useResendVerification } from '@erp/api-client'
import { AuthLayout } from '../components/AuthLayout'

export function VerifyEmailPage() {
  const search = useSearch({ strict: false }) as { email?: string }
  const email = search.email ?? ''
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  const verify = useVerifyEmail()
  const resend = useResendVerification()

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await verify.mutateAsync({ email, code })
      navigate({ to: '/login', search: { verified: '1' } })
    } catch {
      setError('Invalid or expired code. Please try again.')
    }
  }

  async function handleResend() {
    if (!email) return
    setError('')
    try {
      await resend.mutateAsync({ email })
      setResent(true)
      setCode('')
    } catch {
      setError('Could not resend. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <div className="text-4xl mb-5">📬</div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Verify your email
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        We sent a 6-digit code to{' '}
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {email || 'your email address'}
        </span>
        . Enter it below to activate your account.
      </p>

      {error && (
        <div className="auth-error-alert mb-5">{error}</div>
      )}

      {resent && (
        <p className="mb-4 text-sm text-green-600 dark:text-green-400 font-medium">
          Code resent — check your inbox.
        </p>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="auth-field">
          <label className="auth-label">Verification code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="auth-input text-center tracking-[0.5em] text-lg font-mono"
            autoFocus
            required
          />
        </div>

        <button
          type="submit"
          disabled={verify.isPending || code.length !== 6}
          className="auth-btn w-full"
        >
          {verify.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="auth-spinner" />
              Verifying…
            </span>
          ) : (
            'Verify email'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resend.isPending || !email}
          className="text-sm text-brand hover:underline disabled:opacity-50"
        >
          {resend.isPending ? 'Sending…' : "Didn't receive a code? Resend"}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-gray-400">
        <Link to="/login" className="hover:text-gray-600 dark:hover:text-gray-300">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
