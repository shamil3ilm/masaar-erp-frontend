import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuotations, useSendQuotation, useConvertQuotation } from '@erp/api-client'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge,
  Button, Select, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, FileText,
} from '@erp/ui'
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

  const quotations = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Quotations"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Quotations' }]}
        actions={
          <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/quotations/new' })}>
            New Quotation
          </Button>
        }
      />

      <div className="flex gap-3 mb-4">
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="max-w-[180px]"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
          <option value="converted">Converted</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load quotations.</div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quotations found"
          description="Create your first quotation to start sending proposals."
          action={
            <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/quotations/new' })}>
              New Quotation
            </Button>
          }
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
                  <QuotationRow key={q.id} quotation={q} onRefetch={() => void refetch()} />
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
    <TR>
      <TD className="font-mono font-medium">{quotation.quotation_number}</TD>
      <TD>{quotation.customer_name}</TD>
      <TD muted>{fmtDate(quotation.quotation_date)}</TD>
      <TD muted>{fmtDate(quotation.valid_until)}</TD>
      <TD align="end" className="font-mono">{fmtCurrency(quotation.total, quotation.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={quotation.status} /></TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {quotation.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              loading={send.isPending}
              onClick={() => send.mutate(undefined, { onSuccess: onRefetch })}
            >
              Send
            </Button>
          )}
          {(quotation.status === 'sent' || quotation.status === 'accepted') && (
            <Button
              variant="ghost"
              size="sm"
              loading={convert.isPending}
              onClick={() => void convert.mutateAsync().then(() => void navigate({ to: '/app/sales/sales-orders' }))}
            >
              Convert
            </Button>
          )}
        </div>
      </TD>
    </TR>
  )
}
