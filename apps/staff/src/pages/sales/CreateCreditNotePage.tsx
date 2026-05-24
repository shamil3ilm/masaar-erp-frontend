import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateCreditNote, useContacts } from '@erp/api-client'
import { PageHeader } from '@erp/ui'

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
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title="New Credit Note"
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Credit Notes', href: '/app/sales/credit-notes' },
          { label: 'New' },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Credit Note Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Contact *</label>
              <select
                {...register('contact_id')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
              {errors.contact_id && <p className="text-xs text-red-600 mt-1">{errors.contact_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credit Note Date *</label>
              <input
                {...register('credit_note_date')}
                type="date"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Related Invoice ID</label>
              <input
                {...register('invoice_id')}
                placeholder="Optional — paste invoice UUID"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Reason *</label>
              <textarea
                {...register('reason')}
                rows={3}
                placeholder="Reason for credit note..."
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason.message}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Line Items</h2>
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, unit_price: 0, tax_rate: 15 })}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Line
            </button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 mb-3 items-start">
              <div className="col-span-5">
                {index === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>}
                <input
                  {...register(`lines.${index}.description`)}
                  placeholder="Description"
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>}
                <input
                  {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>}
                <input
                  {...register(`lines.${index}.unit_price`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">VAT %</label>}
                <input
                  {...register(`lines.${index}.tax_rate`, { valueAsNumber: true })}
                  type="number"
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="col-span-1 flex items-end pb-0.5">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 text-lg leading-none mt-5"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          {errors.lines && <p className="text-xs text-red-600 mt-1">{String(errors.lines.message)}</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createCreditNote.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createCreditNote.isPending ? 'Creating...' : 'Create Credit Note'}
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: '/app/sales/credit-notes' })}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
