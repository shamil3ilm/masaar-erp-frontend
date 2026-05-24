import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePayment, useContacts } from '@erp/api-client'
import { PageHeader, Card, FormField, Input, Select, Button } from '@erp/ui'

const schema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  payment_date: z.string().min(1, 'Required'),
  amount: z.number().positive('Must be positive'),
  currency_code: z.string().min(1),
  payment_method: z.enum(['cash', 'bank_transfer', 'cheque', 'credit_card', 'online', 'other']),
  reference: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)

export function CreatePaymentPage() {
  const navigate = useNavigate()
  const createPayment = useCreatePayment()
  const { data: contactsData } = useContacts({ contact_type: 'customer', per_page: 100 })
  const customers = contactsData?.data ?? []

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_date: today,
      currency_code: 'SAR',
      payment_method: 'bank_transfer',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await createPayment.mutateAsync(values)
      void navigate({ to: '/app/sales/payments' })
    } catch {
      // validation errors handled by interceptor
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Record Payment"
        back={{ label: 'Back to Payments', href: '/app/sales/payments' }}
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Payments', href: '/app/sales/payments' },
          { label: 'New' },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <FormField label="Customer" required error={errors.customer_id?.message}>
            <Select {...register('customer_id')} error={!!errors.customer_id}>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Payment Date" required>
              <Input type="date" {...register('payment_date')} />
            </FormField>
            <FormField label="Currency">
              <Select {...register('currency_code')}>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Select>
            </FormField>
            <FormField label="Amount" required error={errors.amount?.message}>
              <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} error={!!errors.amount} />
            </FormField>
            <FormField label="Payment Method" required>
              <Select {...register('payment_method')}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="online">Online</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Reference / Cheque #">
            <Input placeholder="e.g., cheque number, transfer ID" {...register('reference')} />
          </FormField>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={createPayment.isPending}>
            {createPayment.isPending ? 'Saving…' : 'Record Payment'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void navigate({ to: '/app/sales/payments' })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
