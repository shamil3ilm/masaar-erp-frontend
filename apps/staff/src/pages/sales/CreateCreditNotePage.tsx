import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateCreditNote, useContacts } from '@erp/api-client'
import {
  PageHeader, Card, CardHeader, FormField, Input, Select, Textarea, Button,
  Plus, Trash2,
} from '@erp/ui'

const lineSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().positive('Must be positive'),
  unit_price: z.number().min(0),
  tax_rate: z.number().min(0).max(100),
})

const schema = z.object({
  contact_id: z.string().min(1, 'Contact is required'),
  credit_note_date: z.string().min(1, 'Required'),
  reason: z.string().min(1, 'Reason is required'),
  invoice_id: z.string().optional(),
  lines: z.array(lineSchema).min(1, 'At least one line item required'),
})

type FormValues = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)

export function CreateCreditNotePage() {
  const navigate = useNavigate()
  const createCreditNote = useCreateCreditNote()
  const { data: contactsData } = useContacts({ per_page: 100 })
  const contacts = contactsData?.data ?? []

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      credit_note_date: today,
      lines: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 15 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        invoice_id: values.invoice_id || undefined,
      }
      await createCreditNote.mutateAsync(payload)
      void navigate({ to: '/app/sales/credit-notes' })
    } catch {
      // validation errors handled by interceptor
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
        <Card>
          <CardHeader title="Credit Note Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Contact" required error={errors.contact_id?.message} className="sm:col-span-2">
              <Select {...register('contact_id')} error={!!errors.contact_id}>
                <option value="">Select contact…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Credit Note Date" required>
              <Input type="date" {...register('credit_note_date')} />
            </FormField>
            <FormField label="Related Invoice ID">
              <Input placeholder="Optional — paste invoice UUID" {...register('invoice_id')} />
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
