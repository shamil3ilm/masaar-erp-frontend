import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useRegister } from '@erp/api-client'
import { useAuthStore } from '../store/auth'
import { AuthLayout } from '../components/AuthLayout'
import { Input, PasswordInput, FormField, Button, Alert } from '@erp/ui'

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
      <h1 className="text-2xl font-semibold text-text mb-1">Create your account</h1>
      <p className="text-sm text-muted mb-8">
        Already have one?{' '}
        <Link to="/login" className="auth-link auth-link-sm">Sign in</Link>
      </p>

      {errors.root && (
        <Alert variant="danger" className="mb-4">{errors.root.message}</Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Full name" error={errors.name?.message}>
          <Input {...field('name')} type="text" autoComplete="name" placeholder="Jane Smith" error={!!errors.name} />
        </FormField>

        <FormField label="Organization name" error={errors.organization_name?.message}>
          <Input {...field('organization_name')} type="text" placeholder="Acme Trading Co." error={!!errors.organization_name} />
        </FormField>

        <FormField label="Work email" error={errors.email?.message}>
          <Input {...field('email')} type="email" autoComplete="email" placeholder="jane@acme.com" error={!!errors.email} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <PasswordInput {...field('password')} autoComplete="new-password" placeholder="Min. 8 characters" error={!!errors.password} />
        </FormField>

        <FormField label="Confirm password" error={errors.password_confirmation?.message}>
          <PasswordInput {...field('password_confirmation')} autoComplete="new-password" placeholder="Repeat your password" error={!!errors.password_confirmation} />
        </FormField>

        <Button type="submit" fullWidth loading={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
