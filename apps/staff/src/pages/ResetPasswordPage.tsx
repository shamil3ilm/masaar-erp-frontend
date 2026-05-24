import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useResetPassword } from '@erp/api-client'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '@erp/ui'

const schema = z
  .object({
    password: z.string().min(8, 'Minimum 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { token?: string; email?: string }
  const token = search.token ?? ''
  const email = search.email ?? ''
  const [done, setDone] = useState(false)

  const resetPassword = useResetPassword()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await resetPassword.mutateAsync({ token, email, ...values })
      setDone(true)
      setTimeout(() => void navigate({ to: '/login' }), 2000)
    } catch (err: unknown) {
      const e = err as { validationErrors?: Record<string, string> }
      if (e.validationErrors) {
        for (const [f, msg] of Object.entries(e.validationErrors)) {
          setError(f as keyof FormValues, { message: msg })
        }
      } else {
        setError('root', { message: 'Reset failed. The link may have expired.' })
      }
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="text-4xl mb-5">✅</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Password updated</h1>
        <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Set new password</h1>
      <p className="text-sm text-gray-500 mb-8">Choose a strong password for your account.</p>

      {errors.root && <p className="mb-4 text-sm text-red-600">{errors.root.message}</p>}

      {!token && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          Invalid reset link.{' '}
          <Link to="/forgot-password" className="underline">Request a new one.</Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
          <PasswordInput {...register('password')} autoComplete="new-password" placeholder="Min. 8 characters" />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
          <PasswordInput {...register('password_confirmation')} autoComplete="new-password" placeholder="Repeat your password" />
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-red-600">{errors.password_confirmation.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={resetPassword.isPending || !token}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {resetPassword.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
