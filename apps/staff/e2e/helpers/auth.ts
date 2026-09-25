import type { Page } from '@playwright/test'
import type { MeResponse } from '@masaar/api-client'
import { failUnmockedApi, mockApi, ok } from './api'
import { LOGIN, PASSWORD, USER, me } from './fixtures'

/**
 * Seal the API, then sign in through the form and wait for the dashboard.
 *
 * `/auth/me` is mocked before the first authenticated page loads because the
 * app layout reads the user's permissions from it on every `/app` route; a
 * spec that skipped it would render with no permissions and no actions.
 */
export async function signIn(page: Page, meResponse: MeResponse = me()): Promise<void> {
  await failUnmockedApi(page)
  await mockApi(page, '/auth/login', ok(LOGIN))
  await mockApi(page, '/auth/me', ok(meResponse))

  await page.goto('/login')
  await page.getByLabel('Email address').fill(USER.email)
  // Exact: the field's own "Show password" toggle is labelled too.
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/app/dashboard')
}
