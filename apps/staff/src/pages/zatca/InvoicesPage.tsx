import { useState } from 'react'
import { useZatcaInvoices, useSubmitInvoice, useRetryInvoice } from '@erp/api-client'
import { ZatcaStatusBadge, LoadingSpinner, EmptyState, PageHeader } from '@erp/ui'
import type { ZatcaInvoice } from '@erp/types'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

export function InvoicesPage() {
  const [page] = useState(1)
  const { data, isLoading } = useZatcaInvoices({ per_page: 100, page })
  const submitInvoice = useSubmitInvoice()
  const retryInvoice = useRetryInvoice()

  const columnDefs: ColDef<ZatcaInvoice>[] = [
    { field: 'invoice_number', headerName: 'Invoice #', width: 140 },
    { field: 'buyer_name', headerName: 'Buyer', flex: 1 },
    {
      field: 'total_amount',
      headerName: 'Amount',
      width: 130,
      valueFormatter: ({ value, data: row }) =>
        `${row?.currency ?? ''} ${Number(value).toLocaleString()}`,
    },
    {
      field: 'vat_amount',
      headerName: 'VAT',
      width: 110,
      valueFormatter: ({ value, data: row }) =>
        `${row?.currency ?? ''} ${Number(value).toLocaleString()}`,
    },
    {
      field: 'submitted_at',
      headerName: 'Submitted',
      width: 160,
      valueFormatter: ({ value }) =>
        value ? new Date(value as string).toLocaleDateString() : '—',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: ({ value }: { value: ZatcaInvoice['status'] }) => (
        <ZatcaStatusBadge status={value} />
      ),
    },
    {
      headerName: 'Actions',
      width: 160,
      cellRenderer: ({ data: row }: { data: ZatcaInvoice }) => (
        <div className="flex gap-2 items-center h-full">
          {row.status === 'pending' && (
            <button
              onClick={() => submitInvoice.mutate(row.id)}
              className="text-xs text-green-700 hover:underline"
            >
              Submit
            </button>
          )}
          {row.status === 'rejected' && (
            <button
              onClick={() => retryInvoice.mutate(row.id)}
              className="text-xs text-orange-700 hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      ),
    },
  ]

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>

  const rows = data?.data ?? []

  return (
    <div className="p-6">
      <PageHeader
        title="ZATCA Invoices"
        breadcrumbs={[{ label: 'Compliance' }, { label: 'ZATCA' }, { label: 'Invoices' }]}
        actions={
          <a
            href="/app/compliance/zatca/invoices/create"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            New Invoice
          </a>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first ZATCA e-invoice to get started."
        />
      ) : (
        <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
          <AgGridReact
            rowData={rows}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={20}
          />
        </div>
      )}
    </div>
  )
}
