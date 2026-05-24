import { useState, type FormEvent } from 'react'
import { AuthLayout, Logo, Input, PasswordInput, Button, FormField, Alert } from '@erp/ui'
import { getApiClient } from '@erp/api-client'
import type { AxiosError } from 'axios'

interface AdminLoginProps {
  onLogin: (token: string) => void
}

interface LoginResponse {
  data: { token: string }
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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await getApiClient().post<LoginResponse>('/auth/login', { email, password })
      onLogin(res.data.data.token)
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: { message?: string }; message?: string }>
      setError(
        axiosErr.response?.data?.error?.message ??
        axiosErr.response?.data?.message ??
        'Login failed. Please check your credentials.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout leftPanel={<AdminBrandPanel />}>
      <div className="auth-right-logo">
        <Logo size={40} showName />
      </div>

      <div className="auth-form-header">
        <h1>Admin sign in</h1>
        <p>Restricted access — authorized staff only.</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-5">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
    </AuthLayout>
  )
}
