import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSalesOrders, useConfirmSalesOrder, useCancelSalesOrder, useConvertOrderToInvoice } from '@erp/api-client'
import { PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge } from '@erp/ui'
import { fmtCurrency, fmtDate } from './fmt'

export function SalesOrdersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading, isError, refetch } = useSalesOrders({
    page,
    per_page: 20,
    status: status || undefined,
  })

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError) return <div className="p-6 text-red-600">Failed to load sales orders.</div>

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title="Sales Orders"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Sales Orders' }]}
      />

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="partially_delivered">Partially Delivered</option>
          <option value="delivered">Delivered</option>
          <option value="invoiced">Invoiced</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No sales orders found"
          description="Convert a quotation or create a sales order to get started."
        />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Order Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Delivery</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <SalesOrderRow key={o.id} order={o} onRefetch={() => void refetch()} navigate={navigate} />
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Page {meta.current_page} of {meta.last_page} &mdash; {meta.total} orders</span>
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

function SalesOrderRow({
  order,
  onRefetch,
  navigate,
}: {
  order: {
    id: string
    order_number: string
    customer_name: string
    order_date: string
    expected_delivery_date: string | null
    total: number
    currency_code: string
    status: string
  }
  onRefetch: () => void
  navigate: ReturnType<typeof useNavigate>
}) {
  const confirm = useConfirmSalesOrder(order.id)
  const cancel = useCancelSalesOrder(order.id)
  const toInvoice = useConvertOrderToInvoice(order.id)

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-mono text-gray-900">{order.order_number}</td>
      <td className="px-4 py-3 text-gray-700">{order.customer_name}</td>
      <td className="px-4 py-3 text-gray-600">{fmtDate(order.order_date)}</td>
      <td className="px-4 py-3 text-gray-600">
        {order.expected_delivery_date ? fmtDate(order.expected_delivery_date) : '—'}
      </td>
      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(order.total, order.currency_code)}</td>
      <td className="px-4 py-3 text-center">
        <SalesStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {order.status === 'draft' && (
            <button
              onClick={() => confirm.mutate(undefined, { onSuccess: onRefetch })}
              disabled={confirm.isPending}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              Confirm
            </button>
          )}
          {(order.status === 'confirmed' || order.status === 'delivered') && (
            <button
              onClick={() => void toInvoice.mutateAsync().then(() => void navigate({ to: '/app/sales/invoices' }))}
              disabled={toInvoice.isPending}
              className="text-xs text-green-600 hover:underline disabled:opacity-50"
            >
              Invoice
            </button>
          )}
          {(order.status === 'draft' || order.status === 'confirmed') && (
            <button
              onClick={() => cancel.mutate(undefined, { onSuccess: onRefetch })}
              disabled={cancel.isPending}
              className="text-xs text-red-500 hover:underline disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
