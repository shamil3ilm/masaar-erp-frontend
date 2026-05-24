import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useRegister } from '@erp/api-client'
import { useAuthStore } from '../store/auth'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '@erp/ui'

const schema = z
  .object({
    name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    organization_name: z.string().min(2, 'Organization name is required'),
    password: z.string().min(8, 'Minimum 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const register = useRegister()

  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const result = await register.mutateAsync(values)
      const org = result.user.organization ?? null
      setAuth(result.token, result.user, org ? [org] : [], org)
      void navigate({ to: '/app/dashboard' })
    } catch (err: unknown) {
      const e = err as { validationErrors?: Record<string, string> }
      if (e.validationErrors) {
        for (const [f, msg] of Object.entries(e.validationErrors)) {
          setError(f as keyof FormValues, { message: msg })
        }
      } else {
        setError('root', { message: 'Registration failed. Please try again.' })
      }
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create your account</h1>
      <p className="text-sm text-gray-500 mb-8">
        Already have one?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
      </p>

      {errors.root && (
        <p className="mb-4 text-sm text-red-600">{errors.root.message}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.name?.message}>
          <input {...field('name')} type="text" autoComplete="name" placeholder="Jane Smith" className={inputCls} />
        </Field>

        <Field label="Organization name" error={errors.organization_name?.message}>
          <input {...field('organization_name')} type="text" placeholder="Acme Trading Co." className={inputCls} />
        </Field>

        <Field label="Work email" error={errors.email?.message}>
          <input {...field('email')} type="email" autoComplete="email" placeholder="jane@acme.com" className={inputCls} />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <PasswordInput {...field('password')} autoComplete="new-password" placeholder="Min. 8 characters" />
        </Field>

        <Field label="Confirm password" error={errors.password_confirmation?.message}>
          <PasswordInput {...field('password_confirmation')} autoComplete="new-password" placeholder="Repeat your password" />
        </Field>

        <button
          type="submit"
          disabled={register.isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {register.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
