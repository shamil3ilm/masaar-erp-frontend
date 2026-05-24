import { test, expect } from '@playwright/test'
import { mockLoginResponse } from './helpers/auth'

test.describe('Authentication', () => {
  test('redirects unauthenticated users from /app/dashboard to /login', async ({ page }) => {
    await page.goto('/app/dashboard')
    await page.waitForURL('**/login')
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows login form with email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) => {
      void route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } }),
      })
    })

    await page.goto('/login')
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid email or password')).toBeVisible()
  })

  test('successful login with single org navigates to dashboard', async ({ page }) => {
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

    await page.waitForURL('**/app/dashboard')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('successful login with multiple orgs shows org picker', async ({ page }) => {
    const multiOrgResponse = {
      ...mockLoginResponse,
      data: {
        ...mockLoginResponse.data,
        organizations: [
          { id: 'org-1', name: 'Test Corp', country: 'SA', currency: 'SAR' },
          { id: 'org-2', name: 'Second Corp', country: 'AE', currency: 'AED' },
        ],
      },
    }

    await page.route('**/api/v1/auth/login', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(multiOrgResponse),
      })
    })

    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.waitForURL('**/org-picker')
    await expect(page.getByText('Select Organization')).toBeVisible()
    await expect(page.getByText('Test Corp')).toBeVisible()
    await expect(page.getByText('Second Corp')).toBeVisible()
  })

  test('org picker selection navigates to dashboard', async ({ page }) => {
    const multiOrgResponse = {
      ...mockLoginResponse,
      data: {
        ...mockLoginResponse.data,
        organizations: [
          { id: 'org-1', name: 'Test Corp', country: 'SA', currency: 'SAR' },
          { id: 'org-2', name: 'Second Corp', country: 'AE', currency: 'AED' },
        ],
      },
    }

    await page.route('**/api/v1/auth/login', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(multiOrgResponse),
      })
    })

    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.waitForURL('**/org-picker')
    await page.getByRole('button', { name: /Second Corp/ }).click()

    await page.waitForURL('**/app/dashboard')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('sets erp_token and erp_org_id in localStorage after login', async ({ page }) => {
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

    await page.waitForURL('**/app/dashboard')

    const token = await page.evaluate(() => localStorage.getItem('erp_token'))
    const orgId = await page.evaluate(() => localStorage.getItem('erp_org_id'))
    expect(token).toBe('test-jwt-token')
    expect(orgId).toBe('org-1')
  })
})
