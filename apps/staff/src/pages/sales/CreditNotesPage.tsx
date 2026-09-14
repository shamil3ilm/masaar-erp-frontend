import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreditNotes, useApproveCreditNote, useVoidCreditNote } from '@masaar/api-client'
import type { CreditNote } from '@masaar/types'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, Alert,
  Button, Select, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, RotateCcw,
} from '@masaar/ui'
import { formatCurrency, formatDate } from '../../lib/format'
import { canApproveCreditNote, canVoidCreditNote } from '../../lib/sales-rules'
import { useActionError, type RowActionHandlers } from '../../lib/use-action-error'
import { ConfirmButton } from '../../components/ConfirmButton'

export function CreditNotesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const action = useActionError()

  const { data, isLoading, isError } = useCreditNotes({
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

      {action.message && <Alert variant="danger" className="mb-4">{action.message}</Alert>}

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
                  <CreditNoteRow key={cn.id} note={cn} onSuccess={action.clear} onError={action.report} />
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

function CreditNoteRow({ note, ...handlers }: { note: CreditNote } & RowActionHandlers) {
  const approve = useApproveCreditNote(note.id)
  const voidNote = useVoidCreditNote(note.id)

  return (
    <TR>
      <TD className="font-mono font-medium">{note.credit_note_number}</TD>
      <TD>{note.contact?.company_name ?? note.contact?.contact_name ?? '—'}</TD>
      <TD muted>{formatDate(note.credit_note_date)}</TD>
      <TD muted className="max-w-xs truncate">{note.reason ?? '—'}</TD>
      <TD align="end" className="font-mono">{formatCurrency(note.total, note.currency_code)}</TD>
      <TD align="end" className="font-mono">{formatCurrency(note.available_amount, note.currency_code)}</TD>
      <TD align="center"><SalesStatusBadge status={note.status} /></TD>
      <TD align="end">
        <div className="flex justify-end gap-1">
          {canApproveCreditNote(note.status) && (
            <Button
              variant="ghost"
              size="sm"
              loading={approve.isPending}
              onClick={() => approve.mutate(undefined, handlers)}
            >
              Approve
            </Button>
          )}
          {canVoidCreditNote(note) && (
            <ConfirmButton
              label="Void"
              title={`Void credit note ${note.credit_note_number}?`}
              description="Its available amount drops to zero and it cannot be applied afterwards."
              loading={voidNote.isPending}
              onConfirm={() => voidNote.mutate(undefined, handlers)}
            />
          )}
        </div>
      </TD>
    </TR>
  )
}
