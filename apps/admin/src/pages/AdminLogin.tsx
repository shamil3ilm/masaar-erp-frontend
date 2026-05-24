import { useState, type FormEvent } from 'react'
import { Logo, Input, PasswordInput, Button, FormField, Alert } from '@erp/ui'
import { getApiClient } from '@erp/api-client'
import type { AxiosError } from 'axios'

interface AdminLoginProps {
  onLogin: (token: string) => void
}

interface LoginResponse {
  data: { token: string }
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
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[400px] flex-col bg-[var(--sidebar-bg)] px-12 py-14 relative overflow-hidden shrink-0">
        <div className="pointer-events-none absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full border border-brand/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full border border-brand/15" />
        <div className="pointer-events-none absolute -bottom-8  -left-8  w-[180px] h-[180px] rounded-full border border-brand/20" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-brand/5 blur-3xl" />

        <Logo size={44} showName nameClassName="font-semibold text-white tracking-tight" />

        <div className="mt-auto space-y-3 relative z-10">
          <p className="text-2xl font-semibold text-white leading-snug">
            Masaar<br />Admin Console
          </p>
          <p className="text-sm text-[var(--sidebar-text)] leading-relaxed max-w-xs">
            Manage organizations, users, and platform settings.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-bg">
        <div className="lg:hidden mb-10">
          <Logo size={40} showName />
        </div>
        <div className="w-full max-w-[360px]">
          <h1 className="text-2xl font-semibold text-text mb-1">Admin sign in</h1>
          <p className="text-sm text-muted mb-8">Restricted access — authorized staff only.</p>

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
                placeholder="••••••••"
              />
            </FormField>

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
