import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { fetchVendorInvoice } from './api.ts'
import { InvoiceViewer } from './InvoiceViewer.tsx'
import type { VendorInvoice } from '@erp/types'

type State =
  | { phase: 'invalid' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; invoice: VendorInvoice }

function App() {
  const params = new URLSearchParams(window.location.search)
  const invoiceId = params.get('invoice')
  const token = params.get('token')

  const [state, setState] = useState<State>(
    invoiceId && token ? { phase: 'loading' } : { phase: 'invalid' },
  )

  useEffect(() => {
    if (!invoiceId || !token) return

    let cancelled = false

    fetchVendorInvoice(invoiceId, token)
      .then((invoice) => {
        if (!cancelled) setState({ phase: 'ready', invoice })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load invoice'
          setState({ phase: 'error', message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [invoiceId, token])

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
