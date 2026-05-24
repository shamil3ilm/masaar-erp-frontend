import { useState } from 'react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useVerifyEmail, useResendVerification } from '@erp/api-client'
import { AuthLayout } from '../components/AuthLayout'
import { Input, Alert, FormField, Button, Mail } from '@erp/ui'

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
      <div className="auth-form-header">
        <div className="auth-2fa-icon">
          <span className="inline-flex w-12 h-12 items-center justify-center rounded-xl bg-brand-subtle">
            <Mail size={22} className="text-brand-dark" />
          </span>
        </div>
        <h1>Verify your email</h1>
        <p>
          We sent a 6-digit code to{' '}
          <span className="font-medium text-text">{email || 'your email address'}</span>.
          Enter it below to activate your account.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-5">{error}</Alert>
      )}

      {resent && (
        <Alert variant="success" className="mb-4">Code resent — check your inbox.</Alert>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <FormField label="Verification code">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center tracking-[0.5em] text-lg font-mono"
            autoFocus
            required
          />
        </FormField>

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={verify.isPending || code.length !== 6}
          loading={verify.isPending}
        >
          Verify email
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={resend.isPending || !email}
          loading={resend.isPending}
        >
          {resend.isPending ? 'Sending…' : "Didn't receive a code? Resend"}
        </Button>
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        <Link to="/login" className="hover:text-text transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
