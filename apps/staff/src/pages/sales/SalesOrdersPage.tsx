import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSalesOrders, useConfirmSalesOrder, useCancelSalesOrder, useConvertOrderToInvoice } from '@masaar/api-client'
import type { SalesOrder } from '@masaar/types'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, Alert,
  Select, Table, THead, TBody, TR, TH, TD, Pagination, Button,
  ShoppingCart,
} from '@masaar/ui'
import { formatCurrency, formatDate } from '../../lib/format'
import { canCancelOrder, canConfirmOrder, canInvoiceOrder } from '../../lib/sales-rules'
import { useActionError, type RowActionHandlers } from '../../lib/use-action-error'
import { ConfirmButton } from '../../components/ConfirmButton'

export function SalesOrdersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const action = useActionError()

  const { data, isLoading, isError } = useSalesOrders({
    page,
    per_page: 20,
    status: status || undefined,
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Sales Orders"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Sales Orders' }]}
      />

      <div className="flex gap-3 mb-4">
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="max-w-[200px]"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="partially_delivered">Partially Delivered</option>
          <option value="delivered">Delivered</option>
          <option value="invoiced">Invoiced</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {action.message && <Alert variant="danger" className="mb-4">{action.message}</Alert>}

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load sales orders.</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No sales orders found"
          description="Convert a quotation or create a sales order to get started."
        />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <Table>
              <THead>
                <TR>
                  <TH>Order #</TH>
                  <TH>Customer</TH>
                  <TH>Order Date</TH>
                  <TH>Delivery</TH>
                  <TH align="end">Total</TH>
                  <TH align="center">Status</TH>
                  <TH align="end">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {orders.map((o) => (
                  <SalesOrderRow key={o.id} order={o} onSuccess={action.clear} onError={action.report} />
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

function SalesOrderRow({ order, onSuccess, onError }: { order: SalesOrder } & RowActionHandlers) {
  const navigate = useNavigate()
  const confirm = useConfirmSalesOrder(order.id)
  const cancel = useCancelSalesOrder(order.id)
  const toInvoice = useConvertOrderToInvoice(order.id)

  return (
    <TR>
      <TD className="font-mono font-medium">{order.order_number}</TD>
      <TD>{order.customer_name ?? '—'}</TD>
      <TD muted>{formatDate(order.order_date)}</TD>
      <TD muted>{formatDate(order.expected_delivery_date)}</TD>
      <TD align="end" className="font-mono">{formatCurrency(order.total, order.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={order.status} /></TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {canConfirmOrder(order.status) && (
            <Button
              variant="ghost"
              size="sm"
              loading={confirm.isPending}
              onClick={() => confirm.mutate(undefined, { onSuccess, onError })}
            >
              Confirm
            </Button>
          )}
          {canInvoiceOrder(order.status) && (
            <Button
              variant="ghost"
              size="sm"
              loading={toInvoice.isPending}
              onClick={() =>
                toInvoice.mutate(undefined, {
                  onSuccess: () => {
                    onSuccess()
                    void navigate({ to: '/app/sales/invoices' })
                  },
                  onError,
                })
              }
            >
              Invoice
            </Button>
          )}
          {canCancelOrder(order.status) && (
            <ConfirmButton
              label="Cancel"
              title={`Cancel order ${order.order_number}?`}
              description="A cancelled sales order cannot be reopened."
              loading={cancel.isPending}
              onConfirm={() => cancel.mutate(undefined, { onSuccess, onError })}
            />
          )}
        </div>
      </TD>
    </TR>
  )
}
