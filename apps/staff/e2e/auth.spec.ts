import { expect, test } from '@playwright/test'
import { failUnmockedApi, failure, mockApi, ok } from './helpers/api'
import { LOGIN, ORGANIZATION, PASSWORD, TOKEN, USER, me } from './helpers/fixtures'
import { signIn } from './helpers/auth'

test.describe('Signing in', () => {
  test('sends a visitor with no session to the sign-in page', async ({ page }) => {
    await failUnmockedApi(page)

    await page.goto('/app/dashboard')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('reports bad credentials and keeps the visitor signed out', async ({ page }) => {
    await failUnmockedApi(page)
    await mockApi(page, '/auth/login', failure('UNAUTHORIZED', 'These credentials do not match our records.'), 401)

    await page.goto('/login')
    await page.getByLabel('Email address').fill(USER.email)
    await page.getByLabel('Password', { exact: true }).fill('not-the-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
    expect(await page.evaluate(() => localStorage.getItem('erp_token'))).toBeNull()
  })

  test('stores the session from the login payload and opens the dashboard', async ({ page }) => {
    await signIn(page)

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    // The payload carries one organization on the user; there is no organizations[].
    const session = await page.evaluate(() => ({
      token: localStorage.getItem('erp_token'),
      orgId: localStorage.getItem('erp_org_id'),
    }))
    expect(session.token).toBe(TOKEN)
    expect(session.orgId).toBe(String(ORGANIZATION.id))
  })

  test('asks for the one-time code when the account has two-factor enabled', async ({ page }) => {
    await failUnmockedApi(page)
    await mockApi(page, '/auth/login', ok({ requires_2fa: true, challenge_token: 'challenge-abc' }))
    await mockApi(page, '/auth/me', ok(me()))

    let challenge: unknown = null
    await mockApi(page, '/auth/2fa/verify', (request) => {
      challenge = request.postDataJSON()
      return ok(LOGIN)
    })

    await page.goto('/login')
    await page.getByLabel('Email address').fill(USER.email)
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: 'Two-step verification' })).toBeVisible()

    // The code field is the only text box on this step.
    await page.getByRole('textbox').fill('123456')
    await page.getByRole('button', { name: 'Verify code' }).click()

    await page.waitForURL('**/app/dashboard')
    expect(challenge).toEqual({ challenge_token: 'challenge-abc', code: '123456' })
  })
})
