import { test, expect } from '@playwright/test'
import { loginAsUser } from './helpers/auth'

const CREATE_URL = '**/api/v1/compliance/zatca/invoices'
const PAGE_URL = '/app/compliance/zatca/invoices/create'

test.describe('ZATCA Create Invoice', () => {
  test('shows the create invoice form', async ({ page }) => {
    await loginAsUser(page)

    await page.goto(PAGE_URL)

    await expect(page.getByText('New ZATCA Invoice')).toBeVisible()
    await expect(page.getByText('Buyer Details')).toBeVisible()
    await expect(page.getByText('Line Items')).toBeVisible()
  })

  test('shows breadcrumbs: Compliance > ZATCA > Invoices > Create', async ({ page }) => {
    await loginAsUser(page)

    await page.goto(PAGE_URL)

    await expect(page.getByText('Compliance')).toBeVisible()
    await expect(page.getByText('ZATCA')).toBeVisible()
    await expect(page.getByText('Create')).toBeVisible()
  })

  test('shows validation error when buyer name is empty', async ({ page }) => {
    await loginAsUser(page)

    await page.goto(PAGE_URL)

    // Submit without filling required fields
    await page.getByRole('button', { name: 'Create Invoice' }).click()

    await expect(page.getByText('Buyer name is required')).toBeVisible()
  })

  test('shows validation error when buyer VAT is too short', async ({ page }) => {
    await loginAsUser(page)

    await page.goto(PAGE_URL)

    await page.getByLabel('Buyer Name').fill('Acme Ltd')
    await page.getByLabel('Buyer VAT Number').fill('12345')  // less than 15 digits

    await page.getByRole('button', { name: 'Create Invoice' }).click()

    await expect(page.getByText('VAT number must be 15 digits')).toBeVisible()
  })

  test('has default invoice type of Standard (B2B)', async ({ page }) => {
    await loginAsUser(page)

    await page.goto(PAGE_URL)

    const select = page.getByLabel('Invoice Type')
    await expect(select).toHaveValue('standard')
  })

  test('has default currency of SAR', async ({ page }) => {
    await loginAsUser(page)

    await page.goto(PAGE_URL)

    const select = page.getByLabel('Currency')
    await expect(select).toHaveValue('SAR')
  })

  test('starts with one default line item', async ({ page }) => {
    await loginAsUser(page)

    await page.goto(PAGE_URL)

    // There should be a Description input for the first line item
    await expect(page.getByPlaceholder('Description').first()).toBeVisible()
  })

  test('Add Line button appends a new line item row', async ({ page }) => {
    await loginAsUser(page)

    await page.goto(PAGE_URL)

    const initialRows = await page.getByPlaceholder('Description').count()
    await page.getByRole('button', { name: '+ Add Line' }).click()
    const newRows = await page.getByPlaceholder('Description').count()

    expect(newRows).toBe(initialRows + 1)
  })

  test('Cancel button navigates back to invoices list', async ({ page }) => {
    await loginAsUser(page)

    // Mock invoices list so the page can render after navigation
    await page.route('**/api/v1/compliance/zatca/invoices', (route) => {
      if (route.request().method() === 'GET') {
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [],
            meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
          }),
        })
      }
    })

    await page.goto(PAGE_URL)
    await page.getByRole('button', { name: 'Cancel' }).click()

    await page.waitForURL('**/compliance/zatca/invoices')
    await expect(page).toHaveURL(/compliance\/zatca\/invoices/)
  })

  test('successfully submits invoice and navigates to invoices list', async ({ page }) => {
    await loginAsUser(page)

    await page.route(CREATE_URL, (route) => {
      if (route.request().method() === 'POST') {
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'inv-2',
              invoice_number: 'INV-002',
              invoice_type: 'standard',
              buyer_name: 'Test Buyer',
              buyer_vat: '300000000000003',
              total_amount: 1150,
              vat_amount: 150,
              currency: 'SAR',
              status: 'pending',
              zatca_uuid: null,
              zatca_hash: null,
              rejection_reason: null,
              submitted_at: null,
              cleared_at: null,
              created_at: '2026-05-03T00:00:00Z',
            },
          }),
        })
      } else {
        // GET after navigation
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [],
            meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
          }),
        })
      }
    })

    await page.goto(PAGE_URL)

    await page.getByLabel('Buyer Name').fill('Test Buyer')
    await page.getByLabel('Buyer VAT Number').fill('300000000000003')

    // Fill in the first line item
    await page.getByPlaceholder('Description').first().fill('Consulting Services')
    await page.locator('input[type="number"]').first().fill('2')
    // Unit price field
    const numericInputs = page.locator('input[type="number"]')
    await numericInputs.nth(1).fill('500')

    await page.getByRole('button', { name: 'Create Invoice' }).click()

    await page.waitForURL('**/compliance/zatca/invoices', { timeout: 10000 })
    await expect(page).toHaveURL(/compliance\/zatca\/invoices/)
  })

  test('shows "Creating..." button state while submitting', async ({ page }) => {
    await loginAsUser(page)

    let resolveRequest: () => void
    const requestPromise = new Promise<void>((r) => { resolveRequest = r })

    await page.route(CREATE_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await requestPromise
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: 'inv-new', invoice_number: 'INV-NEW', status: 'pending' },
          }),
        })
      }
    })

    await page.goto(PAGE_URL)

    await page.getByLabel('Buyer Name').fill('Test Buyer')
    await page.getByLabel('Buyer VAT Number').fill('300000000000003')
    await page.getByPlaceholder('Description').first().fill('Services')
    await page.locator('input[type="number"]').first().fill('1')
    await page.locator('input[type="number"]').nth(1).fill('1000')

    await page.getByRole('button', { name: 'Create Invoice' }).click()

    await expect(page.getByRole('button', { name: 'Creating...' })).toBeVisible()

    // Release the pending request
    resolveRequest!()
  })
})
