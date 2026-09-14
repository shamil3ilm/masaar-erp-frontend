import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateQuotation, useContacts } from '@masaar/api-client'
import {
  PageHeader, Card, CardHeader, FormField, Input, Select, Textarea, Button, Alert,
  Plus, Trash2,
} from '@masaar/ui'
import { useAuthStore } from '../../store/auth'
import { applyApiErrors } from '../../lib/form-errors'
import { CURRENCIES, DEFAULT_CURRENCY, moneyInputProps, quantityInputProps } from '../../lib/money'

const lineSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().positive('Must be positive'),
  unit_price: z.number().min(0, 'Must be non-negative'),
  tax_rate: z.number().min(0).max(100),
})

const schema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  quotation_date: z.string().min(1, 'Required'),
  valid_until: z.string().min(1, 'Required'),
  currency_code: z.string().length(3),
  // The "None" option submits an empty string.
  discount_type: z.enum(['percentage', 'fixed']).or(z.literal('')),
  discount_value: z.number().min(0),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1, 'At least one line item required'),
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

  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quotation_date: today,
      valid_until: in30,
      currency_code: organization?.base_currency ?? DEFAULT_CURRENCY,
      discount_type: '',
      discount_value: 0,
      lines: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 15 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const currency = useWatch({ control, name: 'currency_code' })
  const discountType = useWatch({ control, name: 'discount_type' })

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}

        <Card>
          <CardHeader title="Header" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Customer" required error={errors.customer_id?.message} className="sm:col-span-2">
              <Select {...register('customer_id')} error={!!errors.customer_id}>
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Quotation Date" required error={errors.quotation_date?.message}>
              <Input type="date" {...register('quotation_date')} error={!!errors.quotation_date} />
            </FormField>
            <FormField label="Valid Until" required error={errors.valid_until?.message}>
              <Input type="date" {...register('valid_until')} error={!!errors.valid_until} />
            </FormField>
            <FormField label="Currency" error={errors.currency_code?.message}>
              <Select {...register('currency_code')}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Discount Type" error={errors.discount_type?.message}>
              <Select {...register('discount_type')}>
                <option value="">None</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </Select>
            </FormField>
            <FormField label="Discount Value" error={errors.discount_value?.message}>
              <Input
                {...(discountType === 'fixed' ? moneyInputProps(currency) : quantityInputProps)}
                {...register('discount_value', { valueAsNumber: true })}
                error={!!errors.discount_value}
              />
            </FormField>
            <FormField label="Notes" className="sm:col-span-2" error={errors.notes?.message}>
              <Textarea rows={3} {...register('notes')} />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Line Items"
            actions={
              <Button
                type="button"
                variant="outline"
                size="sm"
                iconLeft={<Plus size={14} />}
                onClick={() => append({ description: '', quantity: 1, unit_price: 0, tax_rate: 15 })}
              >
                Add Line
              </Button>
            }
          />
          <div className="space-y-3">
            {fields.map((field, index) => {
              const lineErrors = errors.lines?.[index]
              const lineMessage = lineErrors?.description?.message ?? lineErrors?.quantity?.message
                ?? lineErrors?.unit_price?.message ?? lineErrors?.tax_rate?.message
              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-12 sm:col-span-5">
                    {index === 0 && <label className="block text-xs font-medium text-muted mb-1">Description</label>}
                    <Input {...register(`lines.${index}.description`)} placeholder="Description" error={!!lineErrors?.description} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    {index === 0 && <label className="block text-xs font-medium text-muted mb-1">Qty</label>}
                    <Input {...quantityInputProps} {...register(`lines.${index}.quantity`, { valueAsNumber: true })} error={!!lineErrors?.quantity} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    {index === 0 && <label className="block text-xs font-medium text-muted mb-1">Unit Price</label>}
                    <Input {...moneyInputProps(currency)} {...register(`lines.${index}.unit_price`, { valueAsNumber: true })} error={!!lineErrors?.unit_price} />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    {index === 0 && <label className="block text-xs font-medium text-muted mb-1">VAT %</label>}
                    <Input {...quantityInputProps} {...register(`lines.${index}.tax_rate`, { valueAsNumber: true })} error={!!lineErrors?.tax_rate} />
                  </div>
                  <div className="col-span-1 flex items-start">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove line"
                        className={index === 0 ? 'mt-6' : ''}
                        onClick={() => remove(index)}
                      >
                        <Trash2 size={14} className="text-danger" />
                      </Button>
                    )}
                  </div>
                  {lineMessage && <p className="col-span-12 text-xs text-danger">{lineMessage}</p>}
                </div>
              )
            })}
          </div>
          {errors.lines?.message && <p className="text-xs text-danger mt-2">{errors.lines.message}</p>}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={createQuotation.isPending}>
            {createQuotation.isPending ? 'Creating…' : 'Create Quotation'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void navigate({ to: '/app/sales/quotations' })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
