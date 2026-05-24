import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForgotPassword } from '@erp/api-client'
import { AuthLayout } from '../components/AuthLayout'
import { Input, FormField, Button, Alert } from '@erp/ui'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const forgotPassword = useForgotPassword()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await forgotPassword.mutateAsync({ email })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-4xl mb-5">📧</div>
        <h1 className="text-2xl font-semibold text-text mb-2">Check your inbox</h1>
        <p className="text-sm text-muted mb-8">
          We sent a reset link to{' '}
          <span className="font-medium text-text">{email}</span>. It may take a minute or two.
        </p>
        <Link to="/login" className="auth-link auth-link-sm">
          ← Back to sign in
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-text mb-1">Forgot your password?</h1>
      <p className="text-sm text-muted mb-8">
        Enter your email and we'll send a reset link.
      </p>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
        </FormField>

        <Button type="submit" fullWidth loading={forgotPassword.isPending}>
          {forgotPassword.isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        <Link to="/login" className="hover:text-text transition-colors">← Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
