import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useContacts } from '@erp/api-client'
import {
  PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge, Badge,
  Button, Input, Select, Table, THead, TBody, TR, TH, TD, Pagination,
  Plus, Users,
} from '@erp/ui'
import { fmtCurrency } from './fmt'

export function ContactsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [contactType, setContactType] = useState('')

  const { data, isLoading, isError } = useContacts({
    page,
    per_page: 20,
    search: search || undefined,
    contact_type: contactType || undefined,
  })

  const contacts = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Contacts"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Contacts' }]}
        actions={
          <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/contacts/new' })}>
            New Contact
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          type="text"
          placeholder="Search company or name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-64"
        />
        <Select
          value={contactType}
          onChange={(e) => { setContactType(e.target.value); setPage(1) }}
          className="max-w-[160px]"
        >
          <option value="">All Types</option>
          <option value="customer">Customer</option>
          <option value="supplier">Supplier</option>
          <option value="both">Both</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-danger">Failed to load contacts.</div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts found"
          description="Create your first contact to start building your customer list."
          action={
            <Button iconLeft={<Plus size={15} />} onClick={() => void navigate({ to: '/app/sales/contacts/new' })}>
              New Contact
            </Button>
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <Table>
              <THead>
                <TR>
                  <TH>Company</TH>
                  <TH>Type</TH>
                  <TH>Contact Name</TH>
                  <TH>Email</TH>
                  <TH align="end">Outstanding</TH>
                  <TH align="center">Status</TH>
                </TR>
              </THead>
              <TBody>
                {contacts.map((c) => (
                  <TR key={c.id}>
                    <TD className="font-medium">{c.company_name}</TD>
                    <TD><SalesStatusBadge status={c.contact_type} /></TD>
                    <TD muted>{c.contact_name ?? '—'}</TD>
                    <TD muted>{c.email ?? '—'}</TD>
                    <TD align="end" className="font-mono">{fmtCurrency(c.outstanding_balance, c.currency_code)}</TD>
                    <TD align="center">
                      {c.payment_block
                        ? <Badge variant="danger" dot>Blocked</Badge>
                        : <Badge variant="success" dot>Active</Badge>}
                    </TD>
                  </TR>
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
