import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForgotPassword } from '@erp/api-client'
import { AuthLayout } from '../components/AuthLayout'

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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Check your inbox</h1>
        <p className="text-sm text-gray-500 mb-8">
          We sent a reset link to{' '}
          <span className="font-medium text-gray-700">{email}</span>. It may take a minute or two.
        </p>
        <Link to="/login" className="text-sm text-blue-600 hover:underline">
          ← Back to sign in
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Forgot your password?</h1>
      <p className="text-sm text-gray-500 mb-8">
        Enter your email and we'll send a reset link.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={forgotPassword.isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {forgotPassword.isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400">
        <Link to="/login" className="hover:text-gray-600">← Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
