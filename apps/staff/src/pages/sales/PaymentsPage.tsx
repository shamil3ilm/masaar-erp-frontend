import { useNavigate } from '@tanstack/react-router'
import { usePaymentsReceived, usePaymentSummary, useCompletePayment, useVoidPayment } from '@masaar/api-client'
import type { PaymentReceived } from '@masaar/types'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, StatCard, Alert,
  Button, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, CreditCard, CheckCircle2,
} from '@masaar/ui'
import { formatCurrency, formatDate } from '../../lib/format'
import { canCompletePayment, canVoidPayment } from '../../lib/sales-rules'
import { useActionError, type RowActionHandlers } from '../../lib/use-action-error'
import { useCan } from '../../lib/use-can'
import { useListFilter } from '../../lib/use-list-filter'
import { PAYMENT_STATUSES } from '../../lib/status-filters'
import { ConfirmButton } from '../../components/ConfirmButton'
import { StatusFilter } from '../../components/StatusFilter'
import { useAuthStore } from '../../store/auth'

export function PaymentsPage() {
  const navigate = useNavigate()
  const can = useCan()
  const { organization } = useAuthStore()
  const { page, setPage, filter: status, setFilter: setStatus } = useListFilter()
  const action = useActionError()

  const { data, isLoading, isError } = usePaymentsReceived({
    page,
    per_page: 20,
    status: status || undefined,
  })
  const { data: summary } = usePaymentSummary()

  const payments = data?.data ?? []
  const meta = data?.meta

  const recordPayment = can('sales.payments.create') ? (
    <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/payments/new' })}>
      Record Payment
    </Button>
  ) : null

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Payments Received"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Payments' }]}
        actions={recordPayment}
      />

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard
            label="Total Received"
            value={formatCurrency(summary.total_amount, organization?.base_currency)}
            icon={CreditCard}
          />
          <StatCard label="Completed Payments" value={String(summary.total_payments)} icon={CheckCircle2} />
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <StatusFilter value={status} onChange={setStatus} options={PAYMENT_STATUSES} />
      </div>

      {action.message && <Alert variant="danger" className="mb-4">{action.message}</Alert>}

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load payments.</div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description="Record a customer payment to get started."
          action={recordPayment}
        />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <Table>
              <THead>
                <TR>
                  <TH>Payment #</TH>
                  <TH>Customer</TH>
                  <TH>Date</TH>
                  <TH>Method</TH>
                  <TH align="end">Amount</TH>
                  <TH align="end">Unallocated</TH>
                  <TH align="center">Status</TH>
                  <TH align="end">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {payments.map((p) => (
                  <PaymentRow key={p.id} payment={p} onSuccess={action.clear} onError={action.report} />
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

function PaymentRow({ payment, ...handlers }: { payment: PaymentReceived } & RowActionHandlers) {
  const can = useCan()
  const complete = useCompletePayment(payment.id)
  const voidPay = useVoidPayment(payment.id)

  return (
    <TR>
      <TD className="font-mono font-medium">{payment.payment_number}</TD>
      <TD>{payment.customer?.name ?? '—'}</TD>
      <TD muted>{formatDate(payment.payment_date)}</TD>
      <TD muted>{payment.payment_method_label}</TD>
      <TD align="end" className="font-mono">{formatCurrency(payment.amount, payment.currency_code)}</TD>
      <TD align="end" className="font-mono">{formatCurrency(payment.unallocated_amount, payment.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={payment.status} /></TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {can('sales.payments.complete') && canCompletePayment(payment.status) && (
            <Button
              variant="ghost"
              size="sm"
              loading={complete.isPending}
              onClick={() => complete.mutate(undefined, handlers)}
            >
              Complete
            </Button>
          )}
          {can('sales.payments.void') && canVoidPayment(payment.status) && (
            <ConfirmButton
              label="Void"
              title={`Void payment ${payment.payment_number}?`}
              description="Voiding removes the payment's invoice allocations and cannot be undone."
              loading={voidPay.isPending}
              onConfirm={() => voidPay.mutate(undefined, handlers)}
            />
          )}
        </div>
      </TD>
    </TR>
  )
}
