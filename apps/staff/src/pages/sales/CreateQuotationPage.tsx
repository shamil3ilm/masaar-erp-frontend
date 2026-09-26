import { useNavigate } from '@tanstack/react-router'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateQuotation, useContacts } from '@masaar/api-client'
import { PageHeader, Card, CardHeader, FormField, Input, Select, Textarea, Button, Alert } from '@masaar/ui'
import { useAuthStore } from '../../store/auth'
import { applyApiErrors } from '../../lib/form-errors'
import { CURRENCIES, DEFAULT_CURRENCY, moneyInputProps, quantityInputProps } from '../../lib/money'
import { emptyLine, linesSchema } from '../../lib/line-items'
import { QUOTATION_TOTALS } from '../../lib/line-totals'
import { LineItemsEditor } from '../../components/line-items/LineItemsEditor'

const schema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  quotation_date: z.string().min(1, 'Required'),
  valid_until: z.string().min(1, 'Required'),
  currency_code: z.string().length(3),
  // The "None" option submits an empty string.
  discount_type: z.enum(['percentage', 'fixed']).or(z.literal('')),
  discount_value: z.number().min(0),
  notes: z.string().optional(),
  lines: linesSchema,
})

type FormValues = z.infer<typeof schema>

const FIELDS = Object.keys(schema.shape)

const today = new Date().toISOString().slice(0, 10)
const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)

export function CreateQuotationPage() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()
  const createQuotation = useCreateQuotation()
  const { data: contactsData } = useContacts({ contact_type: 'customer', per_page: 100 })
  const customers = contactsData?.data ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quotation_date: today,
      valid_until: in30,
      currency_code: organization?.base_currency ?? DEFAULT_CURRENCY,
      discount_type: '',
      discount_value: 0,
      lines: [emptyLine()],
    },
  })
  const { register, control, handleSubmit, setError, formState: { errors } } = form
  const currency = useWatch({ control, name: 'currency_code' })
  const discountType = useWatch({ control, name: 'discount_type' })
  const discountValue = useWatch({ control, name: 'discount_value' })

  async function onSubmit(values: FormValues) {
    try {
      await createQuotation.mutateAsync({
        ...values,
        customer_id: Number(values.customer_id),
        discount_type: values.discount_type || null,
      })
      void navigate({ to: '/app/sales/quotations' })
    } catch (err) {
      applyApiErrors(err, setError, FIELDS)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="New Quotation"
        back={{ label: 'Back to Quotations', href: '/app/sales/quotations' }}
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Quotations', href: '/app/sales/quotations' },
          { label: 'New' },
        ]}
      />
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}

          <Card>
            <CardHeader title="Header" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Customer" htmlFor="customer_id" required error={errors.customer_id?.message} className="sm:col-span-2">
                <Select id="customer_id" {...register('customer_id')} error={!!errors.customer_id}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Quotation Date" htmlFor="quotation_date" required error={errors.quotation_date?.message}>
                <Input id="quotation_date" type="date" {...register('quotation_date')} error={!!errors.quotation_date} />
              </FormField>
              <FormField label="Valid Until" htmlFor="valid_until" required error={errors.valid_until?.message}>
                <Input id="valid_until" type="date" {...register('valid_until')} error={!!errors.valid_until} />
              </FormField>
              <FormField label="Currency" htmlFor="currency_code" error={errors.currency_code?.message}>
                <Select id="currency_code" {...register('currency_code')}>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Discount Type" htmlFor="discount_type" error={errors.discount_type?.message}>
                <Select id="discount_type" {...register('discount_type')}>
                  <option value="">None</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </Select>
              </FormField>
              <FormField label="Discount Value" htmlFor="discount_value" error={errors.discount_value?.message}>
                {/* A fixed discount is money; a percentage is any decimal. */}
                <Input
                  id="discount_value"
                  {...(discountType === 'fixed' ? moneyInputProps(currency) : quantityInputProps)}
                  {...register('discount_value', { valueAsNumber: true })}
                  error={!!errors.discount_value}
                />
              </FormField>
              <FormField label="Notes" htmlFor="notes" className="sm:col-span-2" error={errors.notes?.message}>
                <Textarea id="notes" rows={3} {...register('notes')} />
              </FormField>
            </div>
          </Card>

          <LineItemsEditor
            currency={currency}
            rule={QUOTATION_TOTALS}
            discount={{ type: discountType, value: discountValue }}
          />

          <div className="flex gap-3">
            <Button type="submit" loading={createQuotation.isPending}>
              {createQuotation.isPending ? 'Creating…' : 'Create Quotation'}
            </Button>
            <Button type="button" variant="outline" onClick={() => void navigate({ to: '/app/sales/quotations' })}>
              Cancel
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
