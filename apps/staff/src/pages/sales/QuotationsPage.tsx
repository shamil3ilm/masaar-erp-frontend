import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuotations, useSendQuotation, useConvertQuotation } from '@erp/api-client'
import { PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge } from '@erp/ui'
import { fmtCurrency, fmtDate } from './fmt'

export function QuotationsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading, isError, refetch } = useQuotations({
    page,
    per_page: 20,
    status: status || undefined,
  })

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError) return <div className="p-6 text-red-600">Failed to load quotations.</div>

  const quotations = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title="Quotations"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Quotations' }]}
        actions={
          <button
            onClick={() => void navigate({ to: '/app/sales/quotations/new' })}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            New Quotation
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {quotations.length === 0 ? (
        <EmptyState
          title="No quotations found"
          description="Create your first quotation to start sending proposals."
          action={
            <button
              onClick={() => void navigate({ to: '/app/sales/quotations/new' })}
              className="text-sm text-blue-600 hover:underline"
            >
              New Quotation
            </button>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Number</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Valid Until</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.map((q) => (
                  <QuotationRow key={q.id} quotation={q} onRefetch={() => void refetch()} />
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Page {meta.current_page} of {meta.last_page} &mdash; {meta.total} quotations</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
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

function QuotationRow({
  quotation,
  onRefetch,
}: {
  quotation: {
    id: string
    quotation_number: string
    customer_name: string
    quotation_date: string
    valid_until: string
    total: number
    currency_code: string
    status: string
  }
  onRefetch: () => void
}) {
  const navigate = useNavigate()
  const send = useSendQuotation(quotation.id)
  const convert = useConvertQuotation(quotation.id)

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-mono text-gray-900">{quotation.quotation_number}</td>
      <td className="px-4 py-3 text-gray-700">{quotation.customer_name}</td>
      <td className="px-4 py-3 text-gray-600">{fmtDate(quotation.quotation_date)}</td>
      <td className="px-4 py-3 text-gray-600">{fmtDate(quotation.valid_until)}</td>
      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(quotation.total, quotation.currency_code)}</td>
      <td className="px-4 py-3 text-center">
        <SalesStatusBadge status={quotation.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {quotation.status === 'draft' && (
            <button
              onClick={() => send.mutate(undefined, { onSuccess: onRefetch })}
              disabled={send.isPending}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              Send
            </button>
          )}
          {(quotation.status === 'sent' || quotation.status === 'accepted') && (
            <button
              onClick={() => void convert.mutateAsync().then(() => void navigate({ to: '/app/sales/sales-orders' }))}
              disabled={convert.isPending}
              className="text-xs text-green-600 hover:underline disabled:opacity-50"
            >
              Convert
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
