import { InvoicePage } from './pages/InvoicePage'
import { ErrorPage } from './pages/ErrorPage'

function parseRoute(): { invoiceId: string; token: string } | null {
  const match = window.location.pathname.match(/^\/invoice\/([^/]+)/)
  const token = new URLSearchParams(window.location.search).get('token')
  if (!match || !token) return null
  return { invoiceId: match[1], token }
}

export default function App() {
  const route = parseRoute()

  if (!route) {
    return (
      <ErrorPage
        title="Invalid Link"
        message="This link is missing required parameters. Please use the link provided in your email."
      />
    )
  }

  return <InvoicePage invoiceId={route.invoiceId} token={route.token} />
}
