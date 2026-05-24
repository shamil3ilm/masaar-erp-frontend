import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useResetPassword } from '@erp/api-client'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput, FormField, Button, Alert } from '@erp/ui'

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
        <h1 className="text-2xl font-semibold text-text mb-2">Password updated</h1>
        <p className="text-sm text-muted">Redirecting you to sign in…</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-text mb-1">Set new password</h1>
      <p className="text-sm text-muted mb-8">Choose a strong password for your account.</p>

      {errors.root && <Alert variant="danger" className="mb-4">{errors.root.message}</Alert>}

      {!token && (
        <Alert variant="warning" className="mb-4">
          Invalid reset link.{' '}
          <Link to="/forgot-password" className="underline">Request a new one.</Link>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="New password" error={errors.password?.message}>
          <PasswordInput {...register('password')} autoComplete="new-password" placeholder="Min. 8 characters" error={!!errors.password} />
        </FormField>
        <FormField label="Confirm new password" error={errors.password_confirmation?.message}>
          <PasswordInput {...register('password_confirmation')} autoComplete="new-password" placeholder="Repeat your password" error={!!errors.password_confirmation} />
        </FormField>

        <Button type="submit" fullWidth loading={resetPassword.isPending} disabled={!token}>
          {resetPassword.isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
