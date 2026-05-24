import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useContacts } from '@erp/api-client'
import { PageHeader, LoadingSpinner, EmptyState, SalesStatusBadge } from '@erp/ui'
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

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError) return <div className="p-6 text-red-600">Failed to load contacts.</div>

  const contacts = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title="Contacts"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Contacts' }]}
        actions={
          <button
            onClick={() => void navigate({ to: '/app/sales/contacts/new' })}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            New Contact
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search company or name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={contactType}
          onChange={(e) => { setContactType(e.target.value); setPage(1) }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="customer">Customer</option>
          <option value="supplier">Supplier</option>
          <option value="both">Both</option>
        </select>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts found"
          description="Create your first contact to start building your customer list."
          action={
            <button
              onClick={() => void navigate({ to: '/app/sales/contacts/new' })}
              className="text-sm text-blue-600 hover:underline"
            >
              New Contact
            </button>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Outstanding</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.company_name}</td>
                    <td className="px-4 py-3">
                      <SalesStatusBadge status={c.contact_type} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.contact_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900">
                      {fmtCurrency(c.outstanding_balance, c.currency_code)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.payment_block ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>
                Page {meta.current_page} of {meta.last_page} &mdash; {meta.total} contacts
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
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
