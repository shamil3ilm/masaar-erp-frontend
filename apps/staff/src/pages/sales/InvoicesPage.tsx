import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useInvoices, useInvoiceSummary, useSendInvoice, useVoidInvoice } from '@erp/api-client'
import { PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, DataCard } from '@erp/ui'
import { fmtCurrency, fmtDate } from './fmt'

export function InvoicesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading, isError, refetch } = useInvoices({
    page,
    per_page: 20,
    status: status || undefined,
  })
  const { data: summary } = useInvoiceSummary()

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError) return <div className="p-6 text-red-600">Failed to load invoices.</div>

  const invoices = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title="Invoices"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Invoices' }]}
        actions={
          <button
            onClick={() => void navigate({ to: '/app/sales/invoices/new' })}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            New Invoice
          </button>
        }
      />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <DataCard title="Total Invoiced" value={fmtCurrency(summary.total_invoiced)} />
          <DataCard title="Total Paid" value={fmtCurrency(summary.total_paid)} />
          <DataCard title="Outstanding" value={fmtCurrency(summary.total_outstanding)} />
          <DataCard
            title="Overdue"
            value={`${summary.overdue_count} (${fmtCurrency(summary.overdue_amount)})`}
          />
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="voided">Voided</option>
        </select>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Create your first invoice or convert a sales order."
          action={
            <button
              onClick={() => void navigate({ to: '/app/sales/invoices/new' })}
              className="text-sm text-blue-600 hover:underline"
            >
              New Invoice
            </button>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Due</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Due Amount</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Compliance</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <InvoiceRow key={inv.id} invoice={inv} onRefetch={() => void refetch()} />
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Page {meta.current_page} of {meta.last_page} &mdash; {meta.total} invoices</span>
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

function InvoiceRow({
  invoice,
  onRefetch,
}: {
  invoice: {
    id: string
    invoice_number: string
    customer_name: string
    invoice_date: string
    due_date: string | null
    total: number
    amount_due: number
    currency_code: string
    status: string
    compliance_status: string
  }
  onRefetch: () => void
}) {
  const send = useSendInvoice(invoice.id)
  const voidInv = useVoidInvoice(invoice.id)

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-mono text-gray-900">{invoice.invoice_number}</td>
      <td className="px-4 py-3 text-gray-700">{invoice.customer_name}</td>
      <td className="px-4 py-3 text-gray-600">{fmtDate(invoice.invoice_date)}</td>
      <td className="px-4 py-3 text-gray-600">{invoice.due_date ? fmtDate(invoice.due_date) : '—'}</td>
      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(invoice.total, invoice.currency_code)}</td>
      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(invoice.amount_due, invoice.currency_code)}</td>
      <td className="px-4 py-3 text-center">
        <SalesStatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3 text-center">
        {invoice.compliance_status !== 'not_applicable' && (
          <SalesStatusBadge status={invoice.compliance_status} />
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {invoice.status === 'draft' && (
            <button
              onClick={() => send.mutate(undefined, { onSuccess: onRefetch })}
              disabled={send.isPending}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              Send
            </button>
          )}
          {(invoice.status === 'draft' || invoice.status === 'sent') && (
            <button
              onClick={() => voidInv.mutate(undefined, { onSuccess: onRefetch })}
              disabled={voidInv.isPending}
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
