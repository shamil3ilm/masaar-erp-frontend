import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateZatcaInvoice } from '@erp/api-client'
import { PageHeader } from '@erp/ui'

const lineItemSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().positive('Must be positive'),
  unit_price: z.number().positive('Must be positive'),
  vat_rate: z.number().min(0).max(100),
})

const createInvoiceSchema = z.object({
  buyer_name: z.string().min(1, 'Buyer name is required'),
  buyer_vat: z.string().min(15, 'VAT number must be 15 digits').max(15),
  invoice_type: z.enum(['standard', 'simplified']),
  currency: z.string().default('SAR'),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item required'),
})

type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const createInvoice = useCreateZatcaInvoice()

  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoice_type: 'standard',
      currency: 'SAR',
      line_items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: 15 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' })

  async function onSubmit(values: CreateInvoiceForm) {
    try {
      await createInvoice.mutateAsync(values)
      void navigate({ to: '/app/compliance/zatca/invoices' })
    } catch {
      // 422 errors handled by Axios interceptor — React Hook Form shows them
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader
        title="New ZATCA Invoice"
        breadcrumbs={[{ label: 'Compliance' }, { label: 'ZATCA' }, { label: 'Invoices', href: '/app/compliance/zatca/invoices' }, { label: 'Create' }]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Buyer Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
              <input {...register('buyer_name')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              {errors.buyer_name && <p className="text-xs text-red-600 mt-1">{errors.buyer_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Buyer VAT Number</label>
              <input {...register('buyer_vat')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              {errors.buyer_vat && <p className="text-xs text-red-600 mt-1">{errors.buyer_vat.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Type</label>
              <select {...register('invoice_type')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm">
                <option value="standard">Standard (B2B)</option>
                <option value="simplified">Simplified (B2C)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select {...register('currency')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm">
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Line Items</h2>
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, unit_price: 0, vat_rate: 15 })}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Line
            </button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 mb-3 items-start">
              <div className="col-span-4">
                {index === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>}
                <input {...register(`line_items.${index}.description`)} placeholder="Description"
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
              </div>
              <div className="col-span-2">
                {index === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>}
                <input {...register(`line_items.${index}.quantity`, { valueAsNumber: true })} type="number"
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
              </div>
              <div className="col-span-3">
                {index === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>}
                <input {...register(`line_items.${index}.unit_price`, { valueAsNumber: true })} type="number" step="0.01"
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
              </div>
              <div className="col-span-2">
                {index === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">VAT %</label>}
                <input {...register(`line_items.${index}.vat_rate`, { valueAsNumber: true })} type="number"
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
              </div>
              <div className="col-span-1 flex items-end pb-0.5">
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 text-lg leading-none mt-5">×</button>
                )}
              </div>
            </div>
          ))}
          {errors.line_items && <p className="text-xs text-red-600 mt-1">{String(errors.line_items.message)}</p>}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={createInvoice.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </button>
          <button type="button" onClick={() => void navigate({ to: '/app/compliance/zatca/invoices' })}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
