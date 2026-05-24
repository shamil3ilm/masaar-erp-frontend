import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePayment, useContacts } from '@erp/api-client'
import { PageHeader } from '@erp/ui'

const schema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  payment_date: z.string().min(1, 'Required'),
  amount: z.number().positive('Must be positive'),
  currency_code: z.string().min(1),
  payment_method: z.enum(['cash', 'bank_transfer', 'cheque', 'credit_card', 'online', 'other']),
  reference: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)

export function CreatePaymentPage() {
  const navigate = useNavigate()
  const createPayment = useCreatePayment()
  const { data: contactsData } = useContacts({ contact_type: 'customer', per_page: 100 })
  const customers = contactsData?.data ?? []

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_date: today,
      currency_code: 'SAR',
      payment_method: 'bank_transfer',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await createPayment.mutateAsync(values)
      void navigate({ to: '/app/sales/payments' })
    } catch {
      // validation errors handled by interceptor
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <PageHeader
        title="Record Payment"
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Payments', href: '/app/sales/payments' },
          { label: 'New' },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
          <div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Date *</label>
              <input
                {...register('payment_date')}
                type="date"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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
              <label className="block text-sm font-medium text-gray-700">Amount *</label>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
              <select
                {...register('payment_method')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="online">Online</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reference / Cheque #</label>
            <input
              {...register('reference')}
              placeholder="e.g., cheque number, transfer ID"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createPayment.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createPayment.isPending ? 'Saving...' : 'Record Payment'}
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: '/app/sales/payments' })}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
