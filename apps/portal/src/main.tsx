import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { AxiosError } from 'axios'
import './index.css'
import { fetchPortalInvoice } from './api.ts'
import { InvoiceViewer } from './InvoiceViewer.tsx'
import type { PortalInvoice } from '@masaar/types'

type State =
  | { phase: 'invalid' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; invoice: PortalInvoice }

function App() {
  const params = new URLSearchParams(window.location.search)
  // The backend route takes a numeric invoice id.
  const invoiceId = params.get('invoice')
  const token = params.get('token')
  const valid = !!token && !!invoiceId && /^\d+$/.test(invoiceId)

  const [state, setState] = useState<State>(valid ? { phase: 'loading' } : { phase: 'invalid' })

  useEffect(() => {
    if (!valid || !invoiceId || !token) return

    let cancelled = false

    fetchPortalInvoice(invoiceId, token)
      .then((invoice) => {
        if (!cancelled) setState({ phase: 'ready', invoice })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const status = (err as AxiosError)?.response?.status
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
      <div className="error-page">
        <div className="error-box">
          <div className="error-icon">⚠</div>
          <h1>Invalid invoice link</h1>
          <p>This link is missing required parameters. Please check the link and try again.</p>
        </div>
      </div>
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
    return (
      <div className="error-page">
        <div className="error-box">
          <div className="error-icon">⚠</div>
          <h1>Unable to load invoice</h1>
          <p>{state.message}</p>
        </div>
      </div>
    )
  }

  return <InvoiceViewer invoice={state.invoice} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
