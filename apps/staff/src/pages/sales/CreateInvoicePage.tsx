import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateInvoice, useContacts } from '@erp/api-client'
import { PageHeader } from '@erp/ui'

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
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title="New Invoice"
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Invoices', href: '/app/sales/invoices' },
          { label: 'New' },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Customer *</label>
              <select
                {...register('customer_id')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
              {errors.customer_id && <p className="text-xs text-red-600 mt-1">{errors.customer_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Type *</label>
              <select
                {...register('invoice_type')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="standard">Standard (B2B)</option>
                <option value="simplified">Simplified (B2C)</option>
                <option value="credit_note">Credit Note</option>
                <option value="debit_note">Debit Note</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                {...register('currency_code')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Date *</label>
              <input
                {...register('invoice_date')}
                type="date"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                {...register('due_date')}
                type="date"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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
            disabled={createInvoice.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: '/app/sales/invoices' })}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
