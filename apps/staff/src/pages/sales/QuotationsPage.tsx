import { useNavigate } from '@tanstack/react-router'
import { useQuotations, useSendQuotation, useConvertQuotation } from '@masaar/api-client'
import type { Quotation } from '@masaar/types'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, Alert,
  Button, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, FileText,
} from '@masaar/ui'
import { formatCurrency, formatDate } from '../../lib/format'
import { canConvertQuotation, canSendQuotation } from '../../lib/sales-rules'
import { useActionError, type RowActionHandlers } from '../../lib/use-action-error'
import { useCan } from '../../lib/use-can'
import { useListFilter } from '../../lib/use-list-filter'
import { QUOTATION_STATUSES } from '../../lib/status-filters'
import { StatusFilter } from '../../components/StatusFilter'

export function QuotationsPage() {
  const navigate = useNavigate()
  const can = useCan()
  const { page, setPage, filter: status, setFilter: setStatus } = useListFilter()
  const action = useActionError()

  const { data, isLoading, isError } = useQuotations({
    page,
    per_page: 20,
    status: status || undefined,
  })

  const quotations = data?.data ?? []
  const meta = data?.meta

  const newQuotation = can('sales.quotations.create') ? (
    <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/quotations/new' })}>
      New Quotation
    </Button>
  ) : null

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Quotations"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Quotations' }]}
        actions={newQuotation}
      />

      <div className="flex gap-3 mb-4">
        <StatusFilter value={status} onChange={setStatus} options={QUOTATION_STATUSES} />
      </div>

      {action.message && <Alert variant="danger" className="mb-4">{action.message}</Alert>}

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load quotations.</div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quotations found"
          description="Create your first quotation to start sending proposals."
          action={newQuotation}
        />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <Table>
              <THead>
                <TR>
                  <TH>Number</TH>
                  <TH>Customer</TH>
                  <TH>Date</TH>
                  <TH>Valid Until</TH>
                  <TH align="end">Total</TH>
                  <TH align="center">Status</TH>
                  <TH align="end">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {quotations.map((q) => (
                  <QuotationRow key={q.id} quotation={q} onSuccess={action.clear} onError={action.report} />
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

function QuotationRow({ quotation, onSuccess, onError }: { quotation: Quotation } & RowActionHandlers) {
  const navigate = useNavigate()
  const can = useCan()
  const send = useSendQuotation(quotation.id)
  const convert = useConvertQuotation(quotation.id)

  return (
    <TR>
      <TD className="font-mono font-medium">{quotation.quotation_number}</TD>
      <TD>{quotation.customer?.name ?? quotation.customer_name ?? '—'}</TD>
      <TD muted>{formatDate(quotation.quotation_date)}</TD>
      <TD muted>{formatDate(quotation.valid_until)}</TD>
      <TD align="end" className="font-mono">{formatCurrency(quotation.total, quotation.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={quotation.status} /></TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {can('sales.quotations.send') && canSendQuotation(quotation.status) && (
            <Button
              variant="ghost"
              size="sm"
              loading={send.isPending}
              onClick={() => send.mutate(undefined, { onSuccess, onError })}
            >
              Send
            </Button>
          )}
          {can('sales.quotations.convert') && canConvertQuotation(quotation.status) && (
            <Button
              variant="ghost"
              size="sm"
              loading={convert.isPending}
              onClick={() =>
                convert.mutate('sales_order', {
                  onSuccess: () => {
                    onSuccess()
                    void navigate({ to: '/app/sales/sales-orders' })
                  },
                  onError,
                })
              }
            >
              Convert
            </Button>
          )}
        </div>
      </TD>
    </TR>
  )
}
