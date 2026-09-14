import { useNavigate } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateContact } from '@masaar/api-client'
import { PageHeader, Card, CardHeader, FormField, Input, Select, Button, Alert } from '@masaar/ui'
import { useAuthStore } from '../../store/auth'
import { applyApiErrors } from '../../lib/form-errors'
import { CURRENCIES, DEFAULT_CURRENCY, moneyInputProps } from '../../lib/money'

const schema = z.object({
  company_name: z.string().min(1, 'Required'),
  contact_type: z.enum(['customer', 'supplier', 'both']),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  tax_number: z.string().optional(),
  payment_terms: z.number().int().positive().min(1),
  credit_limit: z.number().min(0),
  currency_code: z.string().length(3),
})

type FormValues = z.infer<typeof schema>

const FIELDS = Object.keys(schema.shape)

export function CreateContactPage() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()
  const createContact = useCreateContact()

  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_type: 'customer',
      payment_terms: 30,
      credit_limit: 0,
      currency_code: organization?.base_currency ?? DEFAULT_CURRENCY,
    },
  })

  const currency = useWatch({ control, name: 'currency_code' })

  async function onSubmit(values: FormValues) {
    try {
      await createContact.mutateAsync({ ...values, email: values.email || undefined })
      void navigate({ to: '/app/sales/contacts' })
    } catch (err) {
      applyApiErrors(err, setError, FIELDS)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="New Contact"
        back={{ label: 'Back to Contacts', href: '/app/sales/contacts' }}
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Contacts', href: '/app/sales/contacts' },
          { label: 'New' },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}

        <Card>
          <CardHeader title="Company Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Company Name" required error={errors.company_name?.message} className="sm:col-span-2">
              <Input {...register('company_name')} error={!!errors.company_name} />
            </FormField>
            <FormField label="Contact Type" required error={errors.contact_type?.message}>
              <Select {...register('contact_type')}>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="both">Both</option>
              </Select>
            </FormField>
            <FormField label="Tax Number" error={errors.tax_number?.message}>
              <Input {...register('tax_number')} error={!!errors.tax_number} />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader title="Contact Person" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name" error={errors.contact_name?.message}>
              <Input {...register('contact_name')} error={!!errors.contact_name} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" {...register('email')} error={!!errors.email} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} error={!!errors.phone} />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader title="Financial Settings" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Currency" error={errors.currency_code?.message}>
              <Select {...register('currency_code')}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Payment Terms (days)" error={errors.payment_terms?.message}>
              <Input type="number" {...register('payment_terms', { valueAsNumber: true })} error={!!errors.payment_terms} />
            </FormField>
            <FormField label="Credit Limit" error={errors.credit_limit?.message}>
              <Input {...moneyInputProps(currency)} {...register('credit_limit', { valueAsNumber: true })} error={!!errors.credit_limit} />
            </FormField>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={createContact.isPending}>
            {createContact.isPending ? 'Saving…' : 'Create Contact'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void navigate({ to: '/app/sales/contacts' })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
