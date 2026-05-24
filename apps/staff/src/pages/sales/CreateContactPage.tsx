import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateContact } from '@erp/api-client'
import { PageHeader, Card, CardHeader, FormField, Input, Select, Button } from '@erp/ui'

const schema = z.object({
  company_name: z.string().min(1, 'Required'),
  contact_type: z.enum(['customer', 'supplier', 'both']),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  tax_number: z.string().optional(),
  payment_terms: z.number().int().positive().min(1),
  credit_limit: z.number().min(0),
  currency_code: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export function CreateContactPage() {
  const navigate = useNavigate()
  const createContact = useCreateContact()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_type: 'customer',
      payment_terms: 30,
      credit_limit: 0,
      currency_code: 'SAR',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await createContact.mutateAsync(values)
      void navigate({ to: '/app/sales/contacts' })
    } catch {
      // validation errors handled by axios interceptor
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
        <Card>
          <CardHeader title="Company Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Company Name" required error={errors.company_name?.message} className="sm:col-span-2">
              <Input {...register('company_name')} error={!!errors.company_name} />
            </FormField>
            <FormField label="Contact Type" required>
              <Select {...register('contact_type')}>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="both">Both</option>
              </Select>
            </FormField>
            <FormField label="Tax Number">
              <Input {...register('tax_number')} />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader title="Contact Person" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name">
              <Input {...register('contact_name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" {...register('email')} error={!!errors.email} />
            </FormField>
            <FormField label="Phone">
              <Input {...register('phone')} />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader title="Financial Settings" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Currency">
              <Select {...register('currency_code')}>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
              </Select>
            </FormField>
            <FormField label="Payment Terms (days)" error={errors.payment_terms?.message}>
              <Input type="number" {...register('payment_terms', { valueAsNumber: true })} error={!!errors.payment_terms} />
            </FormField>
            <FormField label="Credit Limit" error={errors.credit_limit?.message}>
              <Input type="number" step="0.01" {...register('credit_limit', { valueAsNumber: true })} error={!!errors.credit_limit} />
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
