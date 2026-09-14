import { useNavigate } from '@tanstack/react-router'
import { useInvoices, useInvoiceSummary, useSendInvoice, useVoidInvoice } from '@masaar/api-client'
import type { Invoice } from '@masaar/types'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, StatCard, Alert,
  Button, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, Receipt, CreditCard, AlertCircle, CheckCircle2,
} from '@masaar/ui'
import { formatCurrency, formatDate } from '../../lib/format'
import { canSendInvoice, canVoidInvoice } from '../../lib/sales-rules'
import { useActionError, type RowActionHandlers } from '../../lib/use-action-error'
import { useCan } from '../../lib/use-can'
import { useListFilter } from '../../lib/use-list-filter'
import { INVOICE_STATUSES } from '../../lib/status-filters'
import { ConfirmButton } from '../../components/ConfirmButton'
import { StatusFilter } from '../../components/StatusFilter'
import { useAuthStore } from '../../store/auth'

export function InvoicesPage() {
  const navigate = useNavigate()
  const can = useCan()
  const { organization } = useAuthStore()
  const currency = organization?.base_currency
  const { page, setPage, filter: status, setFilter: setStatus } = useListFilter()
  const action = useActionError()

  const { data, isLoading, isError } = useInvoices({
    page,
    per_page: 20,
    status: status || undefined,
  })
  const { data: summary } = useInvoiceSummary()

  const invoices = data?.data ?? []
  const meta = data?.meta

  const newInvoice = can('sales.invoices.create') ? (
    <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/invoices/new' })}>
      New Invoice
    </Button>
  ) : null

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Invoices"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Invoices' }]}
        actions={newInvoice}
      />

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Invoiced"
            value={formatCurrency(summary.total_amount, currency)}
            subtitle={`${summary.total_invoices} invoice${summary.total_invoices === 1 ? '' : 's'}`}
            icon={Receipt}
          />
          <StatCard label="Total Paid" value={formatCurrency(summary.total_paid, currency)} icon={CheckCircle2} />
          <StatCard label="Outstanding" value={formatCurrency(summary.total_outstanding, currency)} icon={CreditCard} />
          <StatCard
            label="Overdue"
            value={formatCurrency(summary.overdue_amount, currency)}
            subtitle={`${summary.overdue_count} invoice${summary.overdue_count === 1 ? '' : 's'}`}
            icon={AlertCircle}
          />
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <StatusFilter value={status} onChange={setStatus} options={INVOICE_STATUSES} />
      </div>

      {action.message && <Alert variant="danger" className="mb-4">{action.message}</Alert>}

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load invoices.</div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices found"
          description="Create your first invoice or convert a sales order."
          action={newInvoice}
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
                  <InvoiceRow key={inv.id} invoice={inv} onSuccess={action.clear} onError={action.report} />
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

function InvoiceRow({ invoice, ...handlers }: { invoice: Invoice } & RowActionHandlers) {
  const can = useCan()
  const send = useSendInvoice(invoice.id)
  const voidInv = useVoidInvoice(invoice.id)
  const compliance = invoice.compliance?.status

  return (
    <TR>
      <TD className="font-mono font-medium">{invoice.invoice_number}</TD>
      <TD>{invoice.customer?.name ?? invoice.customer_name ?? '—'}</TD>
      <TD muted>{formatDate(invoice.invoice_date)}</TD>
      <TD muted>{formatDate(invoice.due_date)}</TD>
      <TD align="end" className="font-mono">{formatCurrency(invoice.total, invoice.currency_code)}</TD>
      <TD align="end" className="font-mono">{formatCurrency(invoice.amount_due, invoice.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={invoice.status} /></TD>
      <TD align="center">
        {compliance && compliance !== 'not_applicable' && <SalesStatusBadge status={compliance} />}
      </TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {can('sales.invoices.send') && canSendInvoice(invoice.status) && (
            <Button
              variant="ghost"
              size="sm"
              loading={send.isPending}
              onClick={() => send.mutate(undefined, handlers)}
            >
              Send
            </Button>
          )}
          {can('sales.invoices.void') && canVoidInvoice(invoice.status) && (
            <ConfirmButton
              label="Void"
              title={`Void invoice ${invoice.invoice_number}?`}
              description="Voiding reverses the invoice's postings and cannot be undone."
              loading={voidInv.isPending}
              onConfirm={() => voidInv.mutate(undefined, handlers)}
            />
          )}
        </div>
      </TD>
    </TR>
  )
}
