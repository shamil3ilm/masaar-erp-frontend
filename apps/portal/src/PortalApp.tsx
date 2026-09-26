import { useEffect, useState } from 'react'
import { parseApiError } from '@masaar/api-client'
import type { PortalInvoice } from '@masaar/types'
import { loadInvoice } from './api'
import { InvoiceViewer } from './InvoiceViewer'
import { ErrorPage } from './pages/ErrorPage'

type State =
  | { phase: 'invalid' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; invoice: PortalInvoice }

/**
 * The whole portal. There is no sign-in and no router: the link a customer was
 * sent carries the invoice id and the token that stands for their session, and
 * the four states below are everything the page can be.
 */
export function PortalApp() {
  const params = new URLSearchParams(window.location.search)
  // The backend route takes a numeric invoice id.
  const invoiceId = params.get('invoice')
  const token = params.get('token')
  const valid = !!token && !!invoiceId && /^\d+$/.test(invoiceId)

  const [state, setState] = useState<State>(valid ? { phase: 'loading' } : { phase: 'invalid' })

  useEffect(() => {
    if (!valid || !invoiceId || !token) return

    let cancelled = false

    loadInvoice(invoiceId, token)
      .then((invoice) => {
        if (!cancelled) setState({ phase: 'ready', invoice })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const { status } = parseApiError(err)
        // The customer is told the link is dead, never why the backend refused.
        let message = 'Unable to load invoice. Please try again later.'
        if (status === 401 || status === 403) message = 'This link has expired or is no longer valid.'
        else if (status === 404) message = 'Invoice not found.'
        setState({ phase: 'error', message })
      })

    return () => {
      cancelled = true
    }
  }, [valid, invoiceId, token])

  if (state.phase === 'invalid') {
    return (
      <ErrorPage
        title="Invalid invoice link"
        message="This link is missing required parameters. Please check the link and try again."
      />
    )
  }

  if (state.phase === 'loading') {
    return (
      <div className="loading-wrap">
        <div className="spinner" role="status" aria-label="Loading invoice" />
        <p>Loading invoice…</p>
      </div>
    )
  }

  if (state.phase === 'error') {
    return <ErrorPage title="Unable to load invoice" message={state.message} />
  }

  return <InvoiceViewer invoice={state.invoice} />
}
