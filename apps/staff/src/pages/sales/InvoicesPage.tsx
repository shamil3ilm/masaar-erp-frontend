import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useInvoices, useInvoiceSummary, useSendInvoice, useVoidInvoice } from '@erp/api-client'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, StatCard,
  Button, Select, Table, THead, TBody, TR, TH, TD, TableEmpty, Pagination,
  Plus, Receipt, CreditCard, AlertCircle, CheckCircle2,
} from '@erp/ui'
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

  const invoices = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Invoices"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Invoices' }]}
        actions={
          <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/invoices/new' })}>
            New Invoice
          </Button>
        }
      />

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Invoiced" value={fmtCurrency(summary.total_invoiced)} icon={Receipt} />
          <StatCard label="Total Paid" value={fmtCurrency(summary.total_paid)} icon={CheckCircle2} />
          <StatCard label="Outstanding" value={fmtCurrency(summary.total_outstanding)} icon={CreditCard} />
          <StatCard
            label="Overdue"
            value={fmtCurrency(summary.overdue_amount)}
            subtitle={`${summary.overdue_count} invoice${summary.overdue_count === 1 ? '' : 's'}`}
            icon={AlertCircle}
          />
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="max-w-[180px]"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="voided">Voided</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load invoices.</div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices found"
          description="Create your first invoice or convert a sales order."
          action={
            <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/invoices/new' })}>
              New Invoice
            </Button>
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <Table>
              <THead>
                <TR>
                  <TH>Invoice #</TH>
                  <TH>Customer</TH>
                  <TH>Date</TH>
                  <TH>Due</TH>
                  <TH align="end">Total</TH>
                  <TH align="end">Due Amount</TH>
                  <TH align="center">Status</TH>
                  <TH align="center">Compliance</TH>
                  <TH align="end">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {invoices.map((inv) => (
                  <InvoiceRow key={inv.id} invoice={inv} onRefetch={() => void refetch()} />
                ))}
              </TBody>
            </Table>
          </div>
          {meta && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              total={meta.total}
              perPage={meta.per_page}
              onPageChange={setPage}
              className="mt-2"
            />
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
    <TR>
      <TD className="font-mono font-medium">{invoice.invoice_number}</TD>
      <TD>{invoice.customer_name}</TD>
      <TD muted>{fmtDate(invoice.invoice_date)}</TD>
      <TD muted>{invoice.due_date ? fmtDate(invoice.due_date) : '—'}</TD>
      <TD align="end" className="font-mono">{fmtCurrency(invoice.total, invoice.currency_code)}</TD>
      <TD align="end" className="font-mono">{fmtCurrency(invoice.amount_due, invoice.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={invoice.status} /></TD>
      <TD align="center">
        {invoice.compliance_status !== 'not_applicable' && (
          <SalesStatusBadge status={invoice.compliance_status} />
        )}
      </TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {invoice.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              loading={send.isPending}
              onClick={() => send.mutate(undefined, { onSuccess: onRefetch })}
            >
              Send
            </Button>
          )}
          {(invoice.status === 'draft' || invoice.status === 'sent') && (
            <Button
              variant="danger-outline"
              size="sm"
              loading={voidInv.isPending}
              onClick={() => voidInv.mutate(undefined, { onSuccess: onRefetch })}
            >
              Void
            </Button>
          )}
        </div>
      </TD>
    </TR>
  )
}
