import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateContact } from '@erp/api-client'
import { PageHeader } from '@erp/ui'

const schema = z.object({
  company_name: z.string().min(1, 'Required'),
  contact_type: z.enum(['customer', 'supplier', 'both']),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  tax_number: z.string().optional(),
  payment_terms: z.number().int().positive().min(1),
  credit_limit: z.number().min(0),
  currency_code: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export function CreateContactPage() {
  const navigate = useNavigate()
  const createContact = useCreateContact()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_type: 'customer',
      payment_terms: 30,
      credit_limit: 0,
      currency_code: 'SAR',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await createContact.mutateAsync(values)
      void navigate({ to: '/app/sales/contacts' })
    } catch {
      // validation errors handled by axios interceptor
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <PageHeader
        title="New Contact"
        breadcrumbs={[
          { label: 'Sales' },
          { label: 'Contacts', href: '/app/sales/contacts' },
          { label: 'New' },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Company Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Company Name *</label>
              <input
                {...register('company_name')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.company_name && <p className="text-xs text-red-600 mt-1">{errors.company_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Type *</label>
              <select
                {...register('contact_type')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax Number</label>
              <input
                {...register('tax_number')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Contact Person</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                {...register('contact_name')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                {...register('phone')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Financial Settings</h2>
          <div className="grid grid-cols-3 gap-4">
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
                <option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Terms (days)</label>
              <input
                {...register('payment_terms', { valueAsNumber: true })}
                type="number"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.payment_terms && <p className="text-xs text-red-600 mt-1">{errors.payment_terms.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
              <input
                {...register('credit_limit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.credit_limit && <p className="text-xs text-red-600 mt-1">{errors.credit_limit.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createContact.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createContact.isPending ? 'Saving...' : 'Create Contact'}
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: '/app/sales/contacts' })}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
