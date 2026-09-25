import { useNavigate } from '@tanstack/react-router'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateInvoice, useContacts } from '@masaar/api-client'
import { PageHeader, Card, CardHeader, FormField, Input, Select, Button, Alert } from '@masaar/ui'
import { useAuthStore } from '../../store/auth'
import { applyApiErrors } from '../../lib/form-errors'
import { CURRENCIES, DEFAULT_CURRENCY } from '../../lib/money'
import { emptyLine, linesSchema } from '../../lib/line-items'
import { INVOICE_TOTALS } from '../../lib/line-totals'
import { LineItemsEditor } from '../../components/line-items/LineItemsEditor'

const schema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  invoice_type: z.enum(['standard', 'simplified', 'credit_note', 'debit_note']),
  invoice_date: z.string().min(1, 'Required'),
  due_date: z.string().optional(),
  currency_code: z.string().length(3),
  lines: linesSchema,
})

type FormValues = z.infer<typeof schema>

const FIELDS = Object.keys(schema.shape)

const today = new Date().toISOString().slice(0, 10)

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()
  const createInvoice = useCreateInvoice()
  const { data: contactsData } = useContacts({ contact_type: 'customer', per_page: 100 })
  const customers = contactsData?.data ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoice_type: 'standard',
      invoice_date: today,
      currency_code: organization?.base_currency ?? DEFAULT_CURRENCY,
      lines: [emptyLine()],
    },
  })
  const { register, control, handleSubmit, setError, formState: { errors } } = form
  const currency = useWatch({ control, name: 'currency_code' })

  async function onSubmit(values: FormValues) {
    try {
      await createInvoice.mutateAsync({
        ...values,
        customer_id: Number(values.customer_id),
        due_date: values.due_date || undefined,
      })
      void navigate({ to: '/app/sales/invoices' })
    } catch (err) {
      applyApiErrors(err, setError, FIELDS)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="New Invoice"
        back={{ label: 'Back to Invoices', href: '/app/sales/invoices' }}
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Invoices', href: '/app/sales/invoices' },
          { label: 'New' },
        ]}
      />
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}

          <Card>
            <CardHeader title="Invoice Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Customer" htmlFor="customer_id" required error={errors.customer_id?.message} className="sm:col-span-2">
                <Select id="customer_id" {...register('customer_id')} error={!!errors.customer_id}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Invoice Type" htmlFor="invoice_type" required error={errors.invoice_type?.message}>
                <Select id="invoice_type" {...register('invoice_type')}>
                  <option value="standard">Standard (B2B)</option>
                  <option value="simplified">Simplified (B2C)</option>
                  <option value="credit_note">Credit Note</option>
                  <option value="debit_note">Debit Note</option>
                </Select>
              </FormField>
              <FormField label="Currency" htmlFor="currency_code" error={errors.currency_code?.message}>
                <Select id="currency_code" {...register('currency_code')}>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Invoice Date" htmlFor="invoice_date" required error={errors.invoice_date?.message}>
                <Input id="invoice_date" type="date" {...register('invoice_date')} error={!!errors.invoice_date} />
              </FormField>
              <FormField label="Due Date" htmlFor="due_date" error={errors.due_date?.message}>
                <Input id="due_date" type="date" {...register('due_date')} error={!!errors.due_date} />
              </FormField>
            </div>
          </Card>

          <LineItemsEditor currency={currency} rule={INVOICE_TOTALS} />

          <div className="flex gap-3">
            <Button type="submit" loading={createInvoice.isPending}>
              {createInvoice.isPending ? 'Creating…' : 'Create Invoice'}
            </Button>
            <Button type="button" variant="outline" onClick={() => void navigate({ to: '/app/sales/invoices' })}>
              Cancel
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
