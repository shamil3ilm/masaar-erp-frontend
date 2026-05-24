import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreditNotes, useApproveCreditNote, useVoidCreditNote } from '@erp/api-client'
import { PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge } from '@erp/ui'
import { fmtCurrency, fmtDate } from './fmt'

export function CreditNotesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading, isError, refetch } = useCreditNotes({
    page,
    per_page: 20,
    status: status || undefined,
  })

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError) return <div className="p-6 text-red-600">Failed to load credit notes.</div>

  const notes = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title="Credit Notes"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Credit Notes' }]}
        actions={
          <button
            onClick={() => void navigate({ to: '/app/sales/credit-notes/new' })}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            New Credit Note
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="applied">Applied</option>
          <option value="refunded">Refunded</option>
          <option value="voided">Voided</option>
        </select>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="No credit notes found"
          description="Issue a credit note to adjust a customer invoice."
          action={
            <button
              onClick={() => void navigate({ to: '/app/sales/credit-notes/new' })}
              className="text-sm text-blue-600 hover:underline"
            >
              New Credit Note
            </button>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Credit Note #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Reason</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Available</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notes.map((cn) => (
                  <CreditNoteRow key={cn.id} note={cn} onRefetch={() => void refetch()} />
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Page {meta.current_page} of {meta.last_page} &mdash; {meta.total} credit notes</span>
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

function CreditNoteRow({
  note,
  onRefetch,
}: {
  note: {
    id: string
    credit_note_number: string
    contact_name: string
    credit_note_date: string
    reason: string
    total: number
    available_amount: number
    status: string
  }
  onRefetch: () => void
}) {
  const approve = useApproveCreditNote(note.id)
  const voidNote = useVoidCreditNote(note.id)

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-mono text-gray-900">{note.credit_note_number}</td>
      <td className="px-4 py-3 text-gray-700">{note.contact_name}</td>
      <td className="px-4 py-3 text-gray-600">{fmtDate(note.credit_note_date)}</td>
      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{note.reason}</td>
      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(note.total)}</td>
      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(note.available_amount)}</td>
      <td className="px-4 py-3 text-center">
        <SalesStatusBadge status={note.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {note.status === 'draft' && (
            <button
              onClick={() => approve.mutate(undefined, { onSuccess: onRefetch })}
              disabled={approve.isPending}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              Approve
            </button>
          )}
          {(note.status === 'draft' || note.status === 'approved') && (
            <button
              onClick={() => voidNote.mutate(undefined, { onSuccess: onRefetch })}
              disabled={voidNote.isPending}
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
