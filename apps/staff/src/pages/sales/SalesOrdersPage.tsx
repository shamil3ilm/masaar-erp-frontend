import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSalesOrders, useConfirmSalesOrder, useCancelSalesOrder, useConvertOrderToInvoice } from '@erp/api-client'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge,
  Select, Table, THead, TBody, TR, TH, TD, Pagination, Button,
  ShoppingCart,
} from '@erp/ui'
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
                  <SalesOrderRow key={o.id} order={o} onRefetch={() => void refetch()} navigate={navigate} />
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
    <TR>
      <TD className="font-mono font-medium">{order.order_number}</TD>
      <TD>{order.customer_name}</TD>
      <TD muted>{fmtDate(order.order_date)}</TD>
      <TD muted>{fmtDate(order.expected_delivery_date)}</TD>
      <TD align="end" className="font-mono">{fmtCurrency(order.total, order.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={order.status} /></TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {order.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              loading={confirm.isPending}
              onClick={() => confirm.mutate(undefined, { onSuccess: onRefetch })}
            >
              Confirm
            </Button>
          )}
          {(order.status === 'confirmed' || order.status === 'delivered') && (
            <Button
              variant="ghost"
              size="sm"
              loading={toInvoice.isPending}
              onClick={() => void toInvoice.mutateAsync().then(() => void navigate({ to: '/app/sales/invoices' }))}
            >
              Invoice
            </Button>
          )}
          {(order.status === 'draft' || order.status === 'confirmed') && (
            <Button
              variant="danger-outline"
              size="sm"
              loading={cancel.isPending}
              onClick={() => cancel.mutate(undefined, { onSuccess: onRefetch })}
            >
              Cancel
            </Button>
          )}
        </div>
      </TD>
    </TR>
  )
}
