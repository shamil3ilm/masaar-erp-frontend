import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mockApi, ok, paginated } from './helpers/api'
import { CUSTOMER, quotation } from './helpers/fixtures'
import { signIn } from './helpers/auth'

/*
 * The document-level discount on a quotation: how each type lands in the
 * totals the page shows, and in the body it posts. computeTotals is unit
 * tested in src/lib/line-totals.test.ts; what only the browser shows is the
 * wiring — the Discount Type select feeding both the live totals and the
 * payload, and "None" posting a null rather than an empty string.
 */

const PAGE = '/app/sales/quotations/new'
const CREATED = quotation()

/** The dates the form starts on: today, valid for the next 30 days. */
const day = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10)

/** The two lines `fillTwoLines` enters, as the form sends them. */
const LINES = [
  { description: 'Structural steel fabrication', quantity: 2, unit_price: 500, tax_rate: 15 },
  { description: 'Delivery to site', quantity: 1, unit_price: 250, tax_rate: 15 },
]

/** Serve the customer list and the quotations endpoint; keep what was posted. */
async function mockQuotations(page: Page): Promise<() => unknown> {
  let posted: unknown = null
  await mockApi(page, '/sales/contacts', paginated([CUSTOMER]))
  await mockApi(page, '/sales/quotations', (request) => {
    if (request.method() !== 'POST') return paginated([CREATED])
    posted = request.postDataJSON()
    return ok(CREATED)
  })
  return () => posted
}

/**
 * Two lines at the default 15% VAT: 2 × 500.00 and 1 × 250.00. Subtotal
 * 1,250.00 and VAT 187.50, which every case below starts from.
 */
async function fillTwoLines(page: Page): Promise<void> {
  await page.getByLabel('Customer').selectOption(String(CUSTOMER.id))
  await page.getByLabel('Line 1 description').fill('Structural steel fabrication')
  await page.getByLabel('Line 1 quantity').fill('2')
  await page.getByLabel('Line 1 unit price').fill('500')

  await page.getByRole('button', { name: 'Add Line' }).click()
  await page.getByLabel('Line 2 description').fill('Delivery to site')
  await page.getByLabel('Line 2 quantity').fill('1')
  await page.getByLabel('Line 2 unit price').fill('250')
}

/*
 * OPEN QUESTION, not settled by the backend: today the discount comes off
 * AFTER tax, so VAT is charged on the undiscounted 1,250.00 in every case
 * below. Were it decided that a document discount reduces the taxable amount,
 * these are the numbers that move: the percentage case would show VAT 168.75
 * and Total 1,293.75, and the fixed case VAT 157.50 and Total 1,207.50. The
 * subtotal and the discount itself stay as they are.
 */

test.describe('A quotation discount', () => {
  test('takes a percentage off the total and posts the type and value', async ({ page }) => {
    await signIn(page)
    const posted = await mockQuotations(page)

    await page.goto(PAGE)
    await fillTwoLines(page)

    await page.getByLabel('Discount Type').selectOption('percentage')
    await page.getByLabel('Discount Value').fill('10')

    // 10% of the 1,250.00 subtotal, subtracted after the 187.50 VAT.
    await expect(page.getByText('1,250.00')).toBeVisible()
    await expect(page.getByText('187.50')).toBeVisible()
    await expect(page.getByText('125.00')).toBeVisible()
    await expect(page.getByText('1,312.50')).toBeVisible()

    await page.getByRole('button', { name: 'Create Quotation' }).click()

    await page.waitForURL('**/app/sales/quotations')
    await expect(page.getByRole('row').filter({ hasText: CREATED.quotation_number })).toBeVisible()
    // `notes` is sent empty rather than omitted; the backend treats it as nullable.
    expect(posted()).toEqual({
      customer_id: CUSTOMER.id,
      quotation_date: day(0),
      valid_until: day(30),
      currency_code: 'SAR',
      discount_type: 'percentage',
      discount_value: 10,
      notes: '',
      lines: LINES,
    })
  })

  test('takes a fixed amount off the total, priced in the chosen currency', async ({ page }) => {
    await signIn(page)
    const posted = await mockQuotations(page)

    await page.goto(PAGE)
    await fillTwoLines(page)

    await page.getByLabel('Discount Type').selectOption('fixed')
    // A percentage is any decimal; a fixed discount is money, so it steps by
    // the smallest unit the currency has.
    await expect(page.getByLabel('Discount Value')).toHaveAttribute('step', '0.01')
    await page.getByLabel('Discount Value').fill('200')

    await expect(page.getByText('1,250.00')).toBeVisible()
    await expect(page.getByText('187.50')).toBeVisible()
    await expect(page.getByText('200.00')).toBeVisible()
    await expect(page.getByText('1,237.50')).toBeVisible()

    await page.getByRole('button', { name: 'Create Quotation' }).click()

    await page.waitForURL('**/app/sales/quotations')
    expect(posted()).toMatchObject({ discount_type: 'fixed', discount_value: 200 })
  })

  test('shows no discount and posts none when the type is left at "None"', async ({ page }) => {
    await signIn(page)
    const posted = await mockQuotations(page)

    await page.goto(PAGE)
    await fillTwoLines(page)

    // Only the "Discount Type" and "Discount Value" labels mention a discount;
    // the totals gain a Discount row only once there is one to show.
    await page.getByLabel('Discount Value').fill('25')
    await expect(page.getByText('Discount', { exact: true })).toHaveCount(0)
    await expect(page.getByText('1,437.50')).toBeVisible()

    await page.getByRole('button', { name: 'Create Quotation' }).click()

    await page.waitForURL('**/app/sales/quotations')
    // The select's empty value becomes a null, never an empty string.
    expect(posted()).toMatchObject({ discount_type: null, discount_value: 25 })
  })
})
