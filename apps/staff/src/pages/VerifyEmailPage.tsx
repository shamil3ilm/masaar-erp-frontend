import { useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { useResendVerification } from '@erp/api-client'
import { AuthLayout } from '../components/AuthLayout'

export function VerifyEmailPage() {
  const search = useSearch({ strict: false }) as { email?: string }
  const email = search.email ?? ''
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')
  const resend = useResendVerification()

  async function handleResend() {
    if (!email) return
    setError('')
    try {
      await resend.mutateAsync({ email })
      setResent(true)
    } catch {
      setError('Could not resend. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <div className="text-4xl mb-5">📬</div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verify your email</h1>
      <p className="text-sm text-gray-500 mb-8">
        We sent a confirmation link to{' '}
        <span className="font-medium text-gray-700">{email || 'your email address'}</span>.
        Click the link to activate your account.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {resent ? (
        <p className="text-sm text-green-700 font-medium mb-6">Verification email resent.</p>
      ) : (
        <button
          onClick={handleResend}
          disabled={resend.isPending || !email}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors mb-6"
        >
          {resend.isPending ? 'Sending…' : 'Resend verification email'}
        </button>
      )}

      <p className="text-sm text-gray-400">
        <Link to="/login" className="hover:text-gray-600">← Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
