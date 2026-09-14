import { useNavigate } from '@tanstack/react-router'
import { useCreditNotes, useApproveCreditNote, useVoidCreditNote } from '@masaar/api-client'
import type { CreditNote } from '@masaar/types'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, Alert,
  Button, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, RotateCcw,
} from '@masaar/ui'
import { formatCurrency, formatDate } from '../../lib/format'
import { canApproveCreditNote, canVoidCreditNote } from '../../lib/sales-rules'
import { useActionError, type RowActionHandlers } from '../../lib/use-action-error'
import { useCan } from '../../lib/use-can'
import { useListFilter } from '../../lib/use-list-filter'
import { CREDIT_NOTE_STATUSES } from '../../lib/status-filters'
import { ConfirmButton } from '../../components/ConfirmButton'
import { StatusFilter } from '../../components/StatusFilter'

export function CreditNotesPage() {
  const navigate = useNavigate()
  const can = useCan()
  const { page, setPage, filter: status, setFilter: setStatus } = useListFilter()
  const action = useActionError()

  const { data, isLoading, isError } = useCreditNotes({
    page,
    per_page: 20,
    status: status || undefined,
  })

  const notes = data?.data ?? []
  const meta = data?.meta

  const newCreditNote = can('sales.credit-notes.create') ? (
    <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/credit-notes/new' })}>
      New Credit Note
    </Button>
  ) : null

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Credit Notes"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Credit Notes' }]}
        actions={newCreditNote}
      />

      <div className="flex gap-3 mb-4">
        <StatusFilter value={status} onChange={setStatus} options={CREDIT_NOTE_STATUSES} />
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
          action={newCreditNote}
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
  const can = useCan()
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
          {can('sales.credit-notes.approve') && canApproveCreditNote(note.status) && (
            <Button
              variant="ghost"
              size="sm"
              loading={approve.isPending}
              onClick={() => approve.mutate(undefined, handlers)}
            >
              Approve
            </Button>
          )}
          {can('sales.credit-notes.void') && canVoidCreditNote(note) && (
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
