import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateCreditNote, useContacts } from '@masaar/api-client'
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
  unit_price: z.number().min(0),
  tax_rate: z.number().min(0).max(100),
})

const schema = z.object({
  contact_id: z.string().min(1, 'Contact is required'),
  credit_note_date: z.string().min(1, 'Required'),
  currency_code: z.string().length(3),
  reason: z.string().min(1, 'Reason is required'),
  // The backend checks this against invoices.id, so it is the numeric ID.
  invoice_id: z.string().regex(/^\d*$/, 'Enter the numeric invoice ID').optional(),
  lines: z.array(lineSchema).min(1, 'At least one line item required'),
})

type FormValues = z.infer<typeof schema>

const FIELDS = Object.keys(schema.shape)

// CreditNoteController validates the lines it copies into `items`.
const RENAME = { items: 'lines' }

const today = new Date().toISOString().slice(0, 10)

export function CreateCreditNotePage() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()
  const createCreditNote = useCreateCreditNote()
  const { data: contactsData } = useContacts({ per_page: 100 })
  const contacts = contactsData?.data ?? []

  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      credit_note_date: today,
      currency_code: organization?.base_currency ?? DEFAULT_CURRENCY,
      lines: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 15 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const currency = useWatch({ control, name: 'currency_code' })

  async function onSubmit(values: FormValues) {
    try {
      await createCreditNote.mutateAsync({
        ...values,
        // This page lives in Sales; purchase credit notes are raised elsewhere.
        credit_note_type: 'sales',
        contact_id: Number(values.contact_id),
        invoice_id: values.invoice_id ? Number(values.invoice_id) : undefined,
      })
      void navigate({ to: '/app/sales/credit-notes' })
    } catch (err) {
      applyApiErrors(err, setError, FIELDS, RENAME)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="New Credit Note"
        back={{ label: 'Back to Credit Notes', href: '/app/sales/credit-notes' }}
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Credit Notes', href: '/app/sales/credit-notes' },
          { label: 'New' },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}

        <Card>
          <CardHeader title="Credit Note Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Contact" required error={errors.contact_id?.message} className="sm:col-span-2">
              <Select {...register('contact_id')} error={!!errors.contact_id}>
                <option value="">Select contact…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Credit Note Date" required error={errors.credit_note_date?.message}>
              <Input type="date" {...register('credit_note_date')} error={!!errors.credit_note_date} />
            </FormField>
            <FormField label="Currency" required error={errors.currency_code?.message}>
              <Select {...register('currency_code')}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Related Invoice ID" error={errors.invoice_id?.message}>
              <Input inputMode="numeric" placeholder="Optional — invoice ID" {...register('invoice_id')} error={!!errors.invoice_id} />
            </FormField>
            <FormField label="Reason" required error={errors.reason?.message} className="sm:col-span-2">
              <Textarea rows={3} placeholder="Reason for credit note…" {...register('reason')} error={!!errors.reason} />
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
          <Button type="submit" loading={createCreditNote.isPending}>
            {createCreditNote.isPending ? 'Creating…' : 'Create Credit Note'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void navigate({ to: '/app/sales/credit-notes' })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
