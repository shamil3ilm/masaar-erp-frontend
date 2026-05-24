import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePaymentsReceived, usePaymentSummary, useCompletePayment, useVoidPayment } from '@erp/api-client'
import { PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, DataCard } from '@erp/ui'
import { fmtCurrency, fmtDate } from './fmt'

export function PaymentsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading, isError, refetch } = usePaymentsReceived({
    page,
    per_page: 20,
    status: status || undefined,
  })
  const { data: summary } = usePaymentSummary()

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError) return <div className="p-6 text-red-600">Failed to load payments.</div>

  const payments = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title="Payments Received"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Payments' }]}
        actions={
          <button
            onClick={() => void navigate({ to: '/app/sales/payments/new' })}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            Record Payment
          </button>
        }
      />

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <DataCard title="Total Received" value={fmtCurrency(summary.total_received)} />
          <DataCard title="Allocated" value={fmtCurrency(summary.total_allocated)} />
          <DataCard title="Unallocated" value={fmtCurrency(summary.total_unallocated)} />
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="bounced">Bounced</option>
          <option value="voided">Voided</option>
        </select>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="Record a customer payment to get started."
          action={
            <button
              onClick={() => void navigate({ to: '/app/sales/payments/new' })}
              className="text-sm text-blue-600 hover:underline"
            >
              Record Payment
            </button>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Payment #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Unallocated</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <PaymentRow key={p.id} payment={p} onRefetch={() => void refetch()} />
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Page {meta.current_page} of {meta.last_page} &mdash; {meta.total} payments</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                  Previous
                </button>
                <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PaymentRow({
  payment,
  onRefetch,
}: {
  payment: {
    id: string
    payment_number: string
    customer_name: string
    payment_date: string
    payment_method: string
    amount: number
    unallocated_amount: number
    currency_code: string
    status: string
  }
  onRefetch: () => void
}) {
  const complete = useCompletePayment(payment.id)
  const voidPay = useVoidPayment(payment.id)

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-mono text-gray-900">{payment.payment_number}</td>
      <td className="px-4 py-3 text-gray-700">{payment.customer_name}</td>
      <td className="px-4 py-3 text-gray-600">{fmtDate(payment.payment_date)}</td>
      <td className="px-4 py-3 text-gray-600 capitalize">{payment.payment_method.replace('_', ' ')}</td>
      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(payment.amount, payment.currency_code)}</td>
      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(payment.unallocated_amount, payment.currency_code)}</td>
      <td className="px-4 py-3 text-center">
        <SalesStatusBadge status={payment.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {payment.status === 'pending' && (
            <button
              onClick={() => complete.mutate(undefined, { onSuccess: onRefetch })}
              disabled={complete.isPending}
              className="text-xs text-green-600 hover:underline disabled:opacity-50"
            >
              Complete
            </button>
          )}
          {(payment.status === 'pending' || payment.status === 'completed') && (
            <button
              onClick={() => voidPay.mutate(undefined, { onSuccess: onRefetch })}
              disabled={voidPay.isPending}
              className="text-xs text-red-500 hover:underline disabled:opacity-50"
            >
              Void
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
