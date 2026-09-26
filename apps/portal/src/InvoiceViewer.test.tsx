/*
 * The invoice document a customer is shown. It is the only screen the portal
 * has, it is what gets printed, and the customer cannot ask anyone here what a
 * number means — so the amounts are checked as the exact strings the API sent,
 * and every field the backend may omit is checked for what stands in its place.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvoiceViewer } from './InvoiceViewer'
import { invoice, line } from './test/fixtures'

/** Intl separates the currency from the amount with a non-breaking space… */
const SAR = 'SAR '

/** …which jest-dom turns into a plain space when it reads an element's text. */
const sar = (amount: string) => `SAR ${amount}`

/** The document holds three tables; each query says which one it means. */
const table = (name: string) => within(screen.getByRole('table', { name }))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('the invoice document', () => {
  it('shows the invoice, its dates and who it is billed to', () => {
    render(<InvoiceViewer invoice={invoice()} />)

    expect(screen.getAllByText('INV-2026-0001')).not.toHaveLength(0)
    expect(screen.getByText('February 10, 2026')).toBeVisible()
    expect(screen.getByText('March 12, 2026')).toBeVisible()
    expect(screen.getByText('Gulf Steel Works')).toBeVisible()
    expect(screen.getByText('VAT: 311111111111113')).toBeVisible()
    expect(screen.getByText('ap@gulfsteel.test')).toBeVisible()
  })

  it('names the status in words rather than showing the backend slug', () => {
    render(<InvoiceViewer invoice={invoice({ status: 'partial' })} />)

    expect(screen.getAllByText('Partially paid')).not.toHaveLength(0)
    expect(screen.queryByText('partial')).not.toBeInTheDocument()
  })

  it('shows each line at the amounts the API sent', () => {
    render(
      <InvoiceViewer
        invoice={invoice({
          lines: [
            line(),
            line({
              id: 2,
              description: 'Site survey',
              quantity: '1.5000',
              unit_price: '200.0000',
              tax_rate: '15.0000',
              tax_amount: '45.0000',
              total: '345.0000',
            }),
          ],
        })}
      />,
    )

    const survey = screen.getByText('Site survey').closest('tr')
    expect(survey).not.toBeNull()
    const cells = within(survey!).getAllByRole('cell').map((cell) => cell.textContent)
    expect(cells).toEqual(['Site survey', '1.5', `${SAR}200.00`, '15%', `${SAR}45.00`, `${SAR}345.00`])
  })

  it('totals the invoice at the amounts the API sent', () => {
    render(<InvoiceViewer invoice={invoice()} />)

    const totals = table('Invoice totals')
    expect(totals.getByText('Subtotal').closest('tr')).toHaveTextContent(sar('1,000.00'))
    expect(totals.getByText('VAT').closest('tr')).toHaveTextContent(sar('150.00'))
    expect(totals.getByText('Total').closest('tr')).toHaveTextContent(sar('1,150.00'))
    expect(totals.getByText('Amount due').closest('tr')).toHaveTextContent(sar('1,150.00'))
  })

  it('leaves out the rows the backend had nothing for', () => {
    render(
      <InvoiceViewer
        invoice={invoice({
          due_date: null,
          compliance_uuid: null,
          customer_name: null,
          customer_email: null,
          customer_tax_number: null,
        })}
      />,
    )

    expect(table('Invoice details').queryByText('Due')).not.toBeInTheDocument()
    expect(screen.queryByText(/ZATCA UUID/)).not.toBeInTheDocument()
    expect(screen.queryByText(/VAT: /)).not.toBeInTheDocument()
    expect(screen.getByText('—')).toBeVisible()
  })

  it('shows the compliance identifier once the invoice has cleared', () => {
    render(<InvoiceViewer invoice={invoice()} />)

    expect(screen.getByText(/ZATCA UUID: 018f3c2a-9b41-7c55-8d3e-b1b2b3b4b5b6/)).toBeVisible()
  })

  it('prints on request', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<InvoiceViewer invoice={invoice()} />)

    await user.click(screen.getByRole('button', { name: 'Print' }))

    expect(print).toHaveBeenCalledTimes(1)
  })

  it('opens with one top-level heading, with the rest below it', () => {
    render(<InvoiceViewer invoice={invoice()} />)

    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName.slice(1)))
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(levels[0]).toBe(1)
    // No level is skipped, which is what lets a screen reader walk the document.
    expect(Math.max(...levels.slice(1)) - 1).toBeLessThanOrEqual(1)
  })
})

describe('what the backend may send that Intl cannot take', () => {
  /*
   * The portal mounts no error boundary. Every one of these used to throw a
   * RangeError out of render, which left the customer a blank white page.
   */
  it('survives a date it cannot parse', () => {
    render(<InvoiceViewer invoice={invoice({ invoice_date: '0000-00-00', status: 'draft' })} />)

    expect(table('Invoice details').getByText('Issued').closest('tr')).toHaveTextContent('—')
  })

  it('survives a currency code Intl will not accept', () => {
    render(<InvoiceViewer invoice={invoice({ currency_code: '' })} />)

    expect(table('Invoice totals').getByText('Total').closest('tr')).toHaveTextContent('1,150.00')
  })

  it('does not claim an unreadable amount is zero', () => {
    render(<InvoiceViewer invoice={invoice({ total: 'n/a' })} />)

    const total = table('Invoice totals').getByText('Total').closest('tr')
    expect(total).toHaveTextContent('—')
    expect(total).not.toHaveTextContent('0.00')
  })
})
