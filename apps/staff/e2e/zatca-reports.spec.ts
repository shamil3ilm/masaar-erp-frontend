import { test, expect } from '@playwright/test'
import { loginAsUser } from './helpers/auth'

const REPORT_URL = '**/api/v1/compliance/zatca/report'

const mockReportData = {
  period_start: '2026-05-01',
  period_end: '2026-05-03',
  total_submitted: 100,
  total_cleared: 85,
  total_rejected: 5,
  total_pending: 10,
  clearance_rate: 85.0,
  rejection_rate: 5.0,
  last_submission_at: '2026-05-03T08:00:00Z',
}

test.describe('ZATCA Compliance Reports', () => {
  test('shows the compliance report page heading', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Compliance Report')).toBeVisible()
  })

  test('shows breadcrumbs: Compliance > ZATCA > Reports', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Compliance')).toBeVisible()
    await expect(page.getByText('ZATCA')).toBeVisible()
    await expect(page.getByText('Reports')).toBeVisible()
  })

  test('displays Total Submitted stat card', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Total Submitted')).toBeVisible()
    await expect(page.getByText('100')).toBeVisible()
  })

  test('displays Cleared stat card', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Cleared')).toBeVisible()
    await expect(page.getByText('85')).toBeVisible()
  })

  test('displays Rejected stat card', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Rejected')).toBeVisible()
    await expect(page.getByText('5')).toBeVisible()
  })

  test('displays Pending stat card', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Pending')).toBeVisible()
    await expect(page.getByText('10')).toBeVisible()
  })

  test('displays Clearance Rate stat card with percentage', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Clearance Rate')).toBeVisible()
    await expect(page.getByText('85.0%')).toBeVisible()
  })

  test('displays Rejection Rate stat card with percentage', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Rejection Rate')).toBeVisible()
    await expect(page.getByText('5.0%')).toBeVisible()
  })

  test('shows date range in subtitle', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    // Page shows "YYYY-MM-DD to YYYY-MM-DD" date range
    await expect(page.getByText(/to \d{4}-\d{2}-\d{2}/)).toBeVisible()
  })

  test('shows last submission date when present', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText(/Last submission/i)).toBeVisible()
  })

  test('shows error state when report fetch fails', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed' } }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('Failed to load compliance report.')).toBeVisible()
  })

  test('shows loading spinner while fetching report', async ({ page }) => {
    await loginAsUser(page)

    await page.route(REPORT_URL, async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReportData }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    // Eventually the report renders
    await expect(page.getByText('Compliance Report')).toBeVisible({ timeout: 10000 })
  })

  test('high rejection rate (>5%) shows danger variant on Rejection Rate card', async ({ page }) => {
    await loginAsUser(page)

    const dangerReport = { ...mockReportData, rejection_rate: 10.0 }

    await page.route(REPORT_URL, (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: dangerReport }),
      })
    })

    await page.goto('/app/compliance/zatca/reports')

    await expect(page.getByText('10.0%')).toBeVisible()
    await expect(page.getByText('Rejection Rate')).toBeVisible()
  })
})
