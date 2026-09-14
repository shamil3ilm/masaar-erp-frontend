import { useNavigate } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePayment, useContacts } from '@masaar/api-client'
import { PageHeader, Card, FormField, Input, Select, Button, Alert } from '@masaar/ui'
import { useAuthStore } from '../../store/auth'
import { applyApiErrors } from '../../lib/form-errors'
import { CURRENCIES, DEFAULT_CURRENCY, moneyInputProps } from '../../lib/money'

const schema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  payment_date: z.string().min(1, 'Required'),
  amount: z.number().positive('Must be positive'),
  currency_code: z.string().length(3),
  payment_method: z.enum(['cash', 'bank_transfer', 'cheque', 'credit_card', 'online', 'other']),
  reference: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const FIELDS = Object.keys(schema.shape)

const today = new Date().toISOString().slice(0, 10)

export function CreatePaymentPage() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()
  const createPayment = useCreatePayment()
  const { data: contactsData } = useContacts({ contact_type: 'customer', per_page: 100 })
  const customers = contactsData?.data ?? []

  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_date: today,
      currency_code: organization?.base_currency ?? DEFAULT_CURRENCY,
      payment_method: 'bank_transfer',
    },
  })

  const currency = useWatch({ control, name: 'currency_code' })

  async function onSubmit(values: FormValues) {
    try {
      await createPayment.mutateAsync({ ...values, customer_id: Number(values.customer_id) })
      void navigate({ to: '/app/sales/payments' })
    } catch (err) {
      applyApiErrors(err, setError, FIELDS)
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
        {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}

        <Card>
          <FormField label="Customer" required error={errors.customer_id?.message}>
            <Select {...register('customer_id')} error={!!errors.customer_id}>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.display_name}</option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Payment Date" required error={errors.payment_date?.message}>
              <Input type="date" {...register('payment_date')} error={!!errors.payment_date} />
            </FormField>
            <FormField label="Currency" error={errors.currency_code?.message}>
              <Select {...register('currency_code')}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Amount" required error={errors.amount?.message}>
              <Input {...moneyInputProps(currency)} {...register('amount', { valueAsNumber: true })} error={!!errors.amount} />
            </FormField>
            <FormField label="Payment Method" required error={errors.payment_method?.message}>
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

          <FormField label="Reference / Cheque #" error={errors.reference?.message}>
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
