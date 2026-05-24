import type { Page } from '@playwright/test'

const TEST_TOKEN = 'test-jwt-token'
const TEST_ORG_ID = 'org-1'

export const mockLoginResponse = {
  success: true,
  data: {
    token: TEST_TOKEN,
    user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
    organizations: [{ id: TEST_ORG_ID, name: 'Test Corp', country: 'SA', currency: 'SAR' }],
  },
}

/**
 * Mocks the login API and performs the full login + org selection flow,
 * leaving the browser on /app/dashboard with auth localStorage set.
 */
export async function loginAsUser(page: Page): Promise<void> {
  // Mock the login endpoint
  await page.route('**/api/v1/auth/login', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLoginResponse),
    })
  })

  await page.goto('/login')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Single org — router navigates directly to /app/dashboard
  await page.waitForURL('**/app/dashboard')
}

export { TEST_TOKEN, TEST_ORG_ID }
