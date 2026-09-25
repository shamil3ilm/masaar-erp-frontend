import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mockApi, ok, paginated } from './helpers/api'
import { INVOICE_SUMMARY, PAID_INVOICE, SENT_INVOICE, invoice, me, permissionsWithout } from './helpers/fixtures'
import { signIn } from './helpers/auth'

const PAGE = '/app/sales/invoices'
const INVOICES = [SENT_INVOICE, PAID_INVOICE]

/** Serve the list filtered the way the backend would, and record each `status` asked for. */
async function mockInvoiceList(page: Page, statuses: (string | null)[]) {
  await mockApi(page, '/sales/invoices/summary', ok(INVOICE_SUMMARY))
  await mockApi(page, '/sales/invoices', (request) => {
    const status = new URL(request.url()).searchParams.get('status')
    statuses.push(status)
    return paginated(status ? INVOICES.filter((inv) => inv.status === status) : INVOICES)
  })
}

test.describe('Invoices list', () => {
  test('shows each invoice with its amounts and statuses, and filters on the server', async ({ page }) => {
    await signIn(page)
    const statuses: (string | null)[] = []
    await mockInvoiceList(page, statuses)

    await page.goto(PAGE)

    await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible()

    // Decimal strings render as money in the organization's currency.
    await expect(page.getByText('Total Invoiced')).toBeVisible()
    await expect(page.getByText('3,450.00')).toBeVisible()

    const sent = page.getByRole('row').filter({ hasText: SENT_INVOICE.invoice_number })
    await expect(sent).toContainText('Gulf Steel Works')
    await expect(sent).toContainText('1,150.00')
    await expect(sent.getByText('Sent')).toBeVisible()
    await expect(sent.getByText('Cleared')).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: PAID_INVOICE.invoice_number })).toBeVisible()

    await page.getByLabel('All Statuses').selectOption('paid')

    await expect(page.getByRole('row').filter({ hasText: PAID_INVOICE.invoice_number })).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: SENT_INVOICE.invoice_number })).toHaveCount(0)
    expect(statuses[0]).toBeNull()
    expect(statuses.at(-1)).toBe('paid')
  })

  test('offers no invoice when there are none to show', async ({ page }) => {
    await signIn(page)
    await mockApi(page, '/sales/invoices/summary', ok(INVOICE_SUMMARY))
    await mockApi(page, '/sales/invoices', paginated([]))

    await page.goto(PAGE)

    await expect(page.getByText('No invoices found')).toBeVisible()
  })

  test('offers a row action only when the status allows it and the user may do it', async ({ page }) => {
    const draft = invoice({
      id: 103,
      invoice_number: 'INV-2026-0003',
      status: 'draft',
      compliance: { status: null, uuid: null, hash: null, qr_code: null, submitted_at: null },
    })

    await signIn(page, me({ permissions: permissionsWithout('sales.invoices.create', 'sales.invoices.void') }))
    await mockApi(page, '/sales/invoices/summary', ok(INVOICE_SUMMARY))
    await mockApi(page, '/sales/invoices', paginated([draft, PAID_INVOICE]))

    await page.goto(PAGE)

    const draftRow = page.getByRole('row').filter({ hasText: draft.invoice_number })
    await expect(draftRow.getByRole('button', { name: 'Send' })).toBeVisible()
    await expect(draftRow.getByRole('button', { name: 'Void' })).toHaveCount(0)

    // A paid invoice cannot be sent, however the permissions read.
    const paidRow = page.getByRole('row').filter({ hasText: PAID_INVOICE.invoice_number })
    await expect(paidRow.getByRole('button', { name: 'Send' })).toHaveCount(0)

    await expect(page.getByRole('button', { name: 'New Invoice' })).toHaveCount(0)
  })
})
