/*
 * The portal's front door. There is no sign-in: the link a customer was sent
 * is the credential, so what the app does with a link — and what it refuses to
 * do with a broken one — is the whole of its access control.
 *
 * The API is answered through the real @masaar/api-client, so these also pin
 * where the token travels and what the customer is told when a call fails.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { failure, ok, stubHttp, type HttpStub, type StubHandler } from '@masaar/test-helpers'
import { PortalApp } from './PortalApp'
import { invoice, LINK_TOKEN } from './test/fixtures'

let http: HttpStub

afterEach(() => {
  http.restore()
  window.history.replaceState({}, '', '/')
})

/** Open the portal on the link a customer clicked. */
function open(search: string, handler: StubHandler) {
  http = stubHttp(handler)
  window.history.replaceState({}, '', search)
  return render(<PortalApp />)
}

const INVOICE = invoice()
const LINK = `/?invoice=${INVOICE.id}&token=${LINK_TOKEN}`

const serveInvoice: StubHandler = () => ({ status: 200, body: ok(INVOICE) })

describe('the link', () => {
  it.each([
    ['nothing at all', '/'],
    ['no token', `/?invoice=${INVOICE.id}`],
    ['no invoice', `/?token=${LINK_TOKEN}`],
    ['an invoice id that is not a number', `/?invoice=101%20OR%201=1&token=${LINK_TOKEN}`],
  ])('refuses a link with %s, without asking the backend', (_case, search) => {
    open(search, serveInvoice)

    expect(screen.getByRole('heading', { name: 'Invalid invoice link' })).toBeVisible()
    expect(http.calls).toEqual([])
  })

  it('fetches the invoice the link names, with the token in the Authorization header', async () => {
    open(LINK, serveInvoice)

    expect(await screen.findByRole('table', { name: 'Invoice line items' })).toBeVisible()
    expect(http.calls).toHaveLength(1)
    expect(http.calls[0]).toMatchObject({
      method: 'GET',
      url: `/portal/invoices/${INVOICE.id}`,
      // Not on the query string: the link token is a credential.
      authorization: `Bearer ${LINK_TOKEN}`,
    })
  })

  it('says it is working while the invoice is on its way', () => {
    open(LINK, () => new Promise<never>(() => {}))

    expect(screen.getByRole('status', { name: 'Loading invoice' })).toBeVisible()
  })

  it('shows the invoice once it arrives', async () => {
    open(LINK, serveInvoice)

    expect(await screen.findByText('Gulf Steel Works')).toBeVisible()
    expect(screen.queryByRole('heading', { name: /Unable to load/ })).not.toBeInTheDocument()
  })
})

describe('when the backend refuses', () => {
  it.each([
    [401, 'This link has expired or is no longer valid.'],
    [403, 'This link has expired or is no longer valid.'],
    [404, 'Invoice not found.'],
    [500, 'Unable to load invoice. Please try again later.'],
  ])('answers a %i with a message the customer can act on', async (status, message) => {
    open(LINK, () => ({ status, body: failure('REFUSED', 'Signed URL signature mismatch for invoice 101.') }))

    expect(await screen.findByRole('heading', { name: 'Unable to load invoice' })).toBeVisible()
    expect(screen.getByText(message)).toBeVisible()
  })

  it('never repeats what the backend said', async () => {
    open(LINK, () => ({
      status: 500,
      body: failure('DB_ERROR', 'SQLSTATE[HY000]: connection refused at 10.0.0.4:3306'),
    }))

    await screen.findByRole('heading', { name: 'Unable to load invoice' })
    expect(document.body).not.toHaveTextContent('SQLSTATE')
    expect(document.body).not.toHaveTextContent('10.0.0.4')
  })

  it('shows no part of an invoice it could not load', async () => {
    open(LINK, () => ({ status: 404, body: failure('NOT_FOUND', 'No query results.') }))

    await screen.findByRole('heading', { name: 'Unable to load invoice' })
    expect(screen.queryByRole('table', { name: 'Invoice line items' })).not.toBeInTheDocument()
    expect(screen.queryByText(INVOICE.invoice_number)).not.toBeInTheDocument()
  })
})
