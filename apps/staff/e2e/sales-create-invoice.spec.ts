import { expect, test } from '@playwright/test'
import { mockApi, ok, paginated } from './helpers/api'
import { CUSTOMER, INVOICE_SUMMARY, SENT_INVOICE, invoice } from './helpers/fixtures'
import { signIn } from './helpers/auth'

const PAGE = '/app/sales/invoices/new'

test.describe('Creating an invoice', () => {
  test('totals the line items before submitting, then posts them', async ({ page }) => {
    await signIn(page)
    await mockApi(page, '/sales/contacts', paginated([CUSTOMER]))
    await mockApi(page, '/sales/invoices/summary', ok(INVOICE_SUMMARY))

    let posted: unknown = null
    await mockApi(page, '/sales/invoices', (request) => {
      if (request.method() !== 'POST') return paginated([SENT_INVOICE])
      posted = request.postDataJSON()
      return ok(invoice())
    })

    await page.goto(PAGE)

    await page.getByLabel('Customer').selectOption(String(CUSTOMER.id))
    await page.getByLabel('Line 1 description').fill('Structural steel fabrication')
    await page.getByLabel('Line 1 quantity').fill('2')
    await page.getByLabel('Line 1 unit price').fill('500')

    await page.getByRole('button', { name: 'Add Line' }).click()
    await page.getByLabel('Line 2 description').fill('Delivery to site')
    await page.getByLabel('Line 2 quantity').fill('1')
    await page.getByLabel('Line 2 unit price').fill('250')

    // 2 × 500 and 1 × 250, each at the default 15% VAT, totalled the way the
    // backend totals an invoice. Only the amounts are pinned: the currency
    // prefix comes from the browser's locale data. Exact labels: each line's
    // VAT amount sits beside its "VAT rate" field.
    await expect(page.getByLabel('Line 1 VAT', { exact: true })).toContainText('150.00')
    await expect(page.getByLabel('Line 2 VAT', { exact: true })).toContainText('37.50')
    await expect(page.getByText('1,250.00')).toBeVisible()
    await expect(page.getByText('187.50')).toBeVisible()
    await expect(page.getByText('1,437.50')).toBeVisible()

    await page.getByRole('button', { name: 'Create Invoice' }).click()

    await page.waitForURL('**/app/sales/invoices')
    await expect(page.getByRole('row').filter({ hasText: SENT_INVOICE.invoice_number })).toBeVisible()

    expect(posted).toEqual({
      customer_id: CUSTOMER.id,
      invoice_type: 'standard',
      invoice_date: new Date().toISOString().slice(0, 10),
      currency_code: 'SAR',
      lines: [
        { description: 'Structural steel fabrication', quantity: 2, unit_price: 500, tax_rate: 15 },
        { description: 'Delivery to site', quantity: 1, unit_price: 250, tax_rate: 15 },
      ],
    })
  })

  test('will not submit without a customer', async ({ page }) => {
    await signIn(page)
    await mockApi(page, '/sales/contacts', paginated([CUSTOMER]))

    let posts = 0
    await mockApi(page, '/sales/invoices', (request) => {
      if (request.method() === 'POST') posts += 1
      return paginated([])
    })

    await page.goto(PAGE)

    await page.getByLabel('Line 1 description').fill('Structural steel fabrication')
    await page.getByRole('button', { name: 'Create Invoice' }).click()

    await expect(page.getByText('Customer is required')).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${PAGE}$`))
    expect(posts).toBe(0)
  })

  test('steps an amount by the smallest unit of the chosen currency', async ({ page }) => {
    await signIn(page)
    await mockApi(page, '/sales/contacts', paginated([CUSTOMER]))

    await page.goto(PAGE)

    await expect(page.getByLabel('Line 1 unit price')).toHaveAttribute('step', '0.01')
    await page.getByLabel('Currency').selectOption('KWD')
    await expect(page.getByLabel('Line 1 unit price')).toHaveAttribute('step', '0.001')
  })
})
