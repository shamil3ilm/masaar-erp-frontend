import { test, expect } from '@playwright/test'
import { loginAsUser } from './helpers/auth'

const INVOICES_URL = '**/api/v1/compliance/zatca/invoices'

const mockInvoicesList = {
  success: true,
  data: [
    {
      id: 'inv-1',
      invoice_number: 'INV-001',
      invoice_type: 'standard',
      buyer_name: 'Acme Ltd',
      buyer_vat: '300000000000003',
      total_amount: 1150.00,
      vat_amount: 150.00,
      currency: 'SAR',
      status: 'cleared',
      zatca_uuid: 'uuid-001',
      zatca_hash: 'hash-001',
      rejection_reason: null,
      submitted_at: '2026-01-15T10:00:00Z',
      cleared_at: '2026-01-15T11:00:00Z',
      created_at: '2026-01-15T09:00:00Z',
    },
  ],
  meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
}

test.describe('ZATCA Invoices List', () => {
  test('shows the invoices page heading', async ({ page }) => {
    await loginAsUser(page)

    await page.route(INVOICES_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInvoicesList),
      })
    })

    await page.goto('/app/compliance/zatca/invoices')

    await expect(page.getByText('ZATCA Invoices')).toBeVisible()
  })

  test('shows breadcrumbs: Compliance > ZATCA > Invoices', async ({ page }) => {
    await loginAsUser(page)

    await page.route(INVOICES_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInvoicesList),
      })
    })

    await page.goto('/app/compliance/zatca/invoices')

    await expect(page.getByText('Compliance')).toBeVisible()
    await expect(page.getByText('ZATCA')).toBeVisible()
    await expect(page.getByText('Invoices')).toBeVisible()
  })

  test('shows "New Invoice" action link', async ({ page }) => {
    await loginAsUser(page)

    await page.route(INVOICES_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInvoicesList),
      })
    })

    await page.goto('/app/compliance/zatca/invoices')

    await expect(page.getByRole('link', { name: 'New Invoice' })).toBeVisible()
  })

  test('displays invoice data in AG Grid', async ({ page }) => {
    await loginAsUser(page)

    await page.route(INVOICES_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInvoicesList),
      })
    })

    await page.goto('/app/compliance/zatca/invoices')

    // AG Grid renders row data — wait for the grid to populate
    await expect(page.getByText('INV-001')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Acme Ltd')).toBeVisible()
  })

  test('shows empty state when no invoices', async ({ page }) => {
    await loginAsUser(page)

    await page.route(INVOICES_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
        }),
      })
    })

    await page.goto('/app/compliance/zatca/invoices')

    await expect(page.getByText('No invoices yet')).toBeVisible()
    await expect(page.getByText('Create your first ZATCA e-invoice to get started.')).toBeVisible()
  })

  test('shows Submit button for pending invoices', async ({ page }) => {
    await loginAsUser(page)

    await page.route(INVOICES_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              ...mockInvoicesList.data[0],
              id: 'inv-pending',
              invoice_number: 'INV-002',
              status: 'pending',
              submitted_at: null,
              cleared_at: null,
            },
          ],
          meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
        }),
      })
    })

    await page.goto('/app/compliance/zatca/invoices')

    await expect(page.getByText('INV-002')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible()
  })

  test('shows Retry button for rejected invoices', async ({ page }) => {
    await loginAsUser(page)

    await page.route(INVOICES_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              ...mockInvoicesList.data[0],
              id: 'inv-rejected',
              invoice_number: 'INV-003',
              status: 'rejected',
              submitted_at: '2026-01-15T10:00:00Z',
              cleared_at: null,
              rejection_reason: 'Invalid VAT number',
            },
          ],
          meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
        }),
      })
    })

    await page.goto('/app/compliance/zatca/invoices')

    await expect(page.getByText('INV-003')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('Submit action calls the submit endpoint', async ({ page }) => {
    await loginAsUser(page)

    await page.route(INVOICES_URL, (route) => {
      if (route.request().method() === 'GET') {
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                ...mockInvoicesList.data[0],
                id: 'inv-pending',
                invoice_number: 'INV-002',
                status: 'pending',
                submitted_at: null,
                cleared_at: null,
              },
            ],
            meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
          }),
        })
      }
    })

    let submitCalled = false
    await page.route('**/api/v1/compliance/zatca/invoices/inv-pending/submit', (route) => {
      submitCalled = true
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { ...mockInvoicesList.data[0], id: 'inv-pending', status: 'submitted' },
        }),
      })
    })

    await page.goto('/app/compliance/zatca/invoices')

    await expect(page.getByText('INV-002')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Submit' }).click()

    expect(submitCalled).toBe(true)
  })
})
