import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreditNotes, useApproveCreditNote, useVoidCreditNote } from '@erp/api-client'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge,
  Button, Select, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, RotateCcw,
} from '@erp/ui'
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

  const notes = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Credit Notes"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Credit Notes' }]}
        actions={
          <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/credit-notes/new' })}>
            New Credit Note
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
          <option value="approved">Approved</option>
          <option value="applied">Applied</option>
          <option value="refunded">Refunded</option>
          <option value="voided">Voided</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load credit notes.</div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No credit notes found"
          description="Issue a credit note to adjust a customer invoice."
          action={
            <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/credit-notes/new' })}>
              New Credit Note
            </Button>
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <Table>
              <THead>
                <TR>
                  <TH>Credit Note #</TH>
                  <TH>Contact</TH>
                  <TH>Date</TH>
                  <TH>Reason</TH>
                  <TH align="end">Total</TH>
                  <TH align="end">Available</TH>
                  <TH align="center">Status</TH>
                  <TH align="end">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {notes.map((cn) => (
                  <CreditNoteRow key={cn.id} note={cn} onRefetch={() => void refetch()} />
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
    <TR>
      <TD className="font-mono font-medium">{note.credit_note_number}</TD>
      <TD>{note.contact_name}</TD>
      <TD muted>{fmtDate(note.credit_note_date)}</TD>
      <TD muted className="max-w-xs truncate">{note.reason}</TD>
      <TD align="end" className="font-mono">{fmtCurrency(note.total)}</TD>
      <TD align="end" className="font-mono">{fmtCurrency(note.available_amount)}</TD>
      <TD align="center"><SalesStatusBadge status={note.status} /></TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {note.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              loading={approve.isPending}
              onClick={() => approve.mutate(undefined, { onSuccess: onRefetch })}
            >
              Approve
            </Button>
          )}
          {(note.status === 'draft' || note.status === 'approved') && (
            <Button
              variant="danger-outline"
              size="sm"
              loading={voidNote.isPending}
              onClick={() => voidNote.mutate(undefined, { onSuccess: onRefetch })}
            >
              Void
            </Button>
          )}
        </div>
      </TD>
    </TR>
  )
}
