import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateInvoice, useContacts } from '@erp/api-client'
import {
  PageHeader, Card, CardHeader, FormField, Input, Select, Button,
  Plus, Trash2,
} from '@erp/ui'

const lineSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().positive('Must be positive'),
  unit_price: z.number().min(0),
  tax_rate: z.number().min(0).max(100),
})

const schema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  invoice_type: z.enum(['standard', 'simplified', 'credit_note', 'debit_note']),
  invoice_date: z.string().min(1, 'Required'),
  due_date: z.string().optional(),
  currency_code: z.string().min(1),
  lines: z.array(lineSchema).min(1, 'At least one line item required'),
})

type FormValues = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const createInvoice = useCreateInvoice()
  const { data: contactsData } = useContacts({ contact_type: 'customer', per_page: 100 })
  const customers = contactsData?.data ?? []

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoice_type: 'standard',
      invoice_date: today,
      currency_code: 'SAR',
      lines: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 15 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  async function onSubmit(values: FormValues) {
    try {
      await createInvoice.mutateAsync(values as never)
      void navigate({ to: '/app/sales/invoices' })
    } catch {
      // validation errors handled by interceptor
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader title="Invoice Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Customer" required error={errors.customer_id?.message} className="sm:col-span-2">
              <Select {...register('customer_id')} error={!!errors.customer_id}>
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Invoice Type" required>
              <Select {...register('invoice_type')}>
                <option value="standard">Standard (B2B)</option>
                <option value="simplified">Simplified (B2C)</option>
                <option value="credit_note">Credit Note</option>
                <option value="debit_note">Debit Note</option>
              </Select>
            </FormField>
            <FormField label="Currency">
              <Select {...register('currency_code')}>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Select>
            </FormField>
            <FormField label="Invoice Date" required>
              <Input type="date" {...register('invoice_date')} />
            </FormField>
            <FormField label="Due Date">
              <Input type="date" {...register('due_date')} />
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
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 sm:col-span-5">
                  {index === 0 && <label className="block text-xs font-medium text-muted mb-1">Description</label>}
                  <Input {...register(`lines.${index}.description`)} placeholder="Description" />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  {index === 0 && <label className="block text-xs font-medium text-muted mb-1">Qty</label>}
                  <Input type="number" {...register(`lines.${index}.quantity`, { valueAsNumber: true })} />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  {index === 0 && <label className="block text-xs font-medium text-muted mb-1">Unit Price</label>}
                  <Input type="number" step="0.01" {...register(`lines.${index}.unit_price`, { valueAsNumber: true })} />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  {index === 0 && <label className="block text-xs font-medium text-muted mb-1">VAT %</label>}
                  <Input type="number" {...register(`lines.${index}.tax_rate`, { valueAsNumber: true })} />
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
              </div>
            ))}
          </div>
          {errors.lines && <p className="text-xs text-danger mt-2">{String(errors.lines.message)}</p>}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={createInvoice.isPending}>
            {createInvoice.isPending ? 'Creating…' : 'Create Invoice'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void navigate({ to: '/app/sales/invoices' })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
