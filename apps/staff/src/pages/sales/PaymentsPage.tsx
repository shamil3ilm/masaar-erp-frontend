import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePaymentsReceived, usePaymentSummary, useCompletePayment, useVoidPayment } from '@erp/api-client'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, StatCard,
  Button, Select, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, CreditCard, CheckCircle2, AlertCircle,
} from '@erp/ui'
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

  const payments = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Payments Received"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Payments' }]}
        actions={
          <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/payments/new' })}>
            Record Payment
          </Button>
        }
      />

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Received" value={fmtCurrency(summary.total_received)} icon={CreditCard} />
          <StatCard label="Allocated" value={fmtCurrency(summary.total_allocated)} icon={CheckCircle2} />
          <StatCard label="Unallocated" value={fmtCurrency(summary.total_unallocated)} icon={AlertCircle} />
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="max-w-[180px]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="bounced">Bounced</option>
          <option value="voided">Voided</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load payments.</div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description="Record a customer payment to get started."
          action={
            <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/payments/new' })}>
              Record Payment
            </Button>
          }
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
                  <PaymentRow key={p.id} payment={p} onRefetch={() => void refetch()} />
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
    <TR>
      <TD className="font-mono font-medium">{payment.payment_number}</TD>
      <TD>{payment.customer_name}</TD>
      <TD muted>{fmtDate(payment.payment_date)}</TD>
      <TD muted className="capitalize">{payment.payment_method.replace('_', ' ')}</TD>
      <TD align="end" className="font-mono">{fmtCurrency(payment.amount, payment.currency_code)}</TD>
      <TD align="end" className="font-mono">{fmtCurrency(payment.unallocated_amount, payment.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={payment.status} /></TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {payment.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              loading={complete.isPending}
              onClick={() => complete.mutate(undefined, { onSuccess: onRefetch })}
            >
              Complete
            </Button>
          )}
          {(payment.status === 'pending' || payment.status === 'completed') && (
            <Button
              variant="danger-outline"
              size="sm"
              loading={voidPay.isPending}
              onClick={() => voidPay.mutate(undefined, { onSuccess: onRefetch })}
            >
              Void
            </Button>
          )}
        </div>
      </TD>
    </TR>
  )
}
