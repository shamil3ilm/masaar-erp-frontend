import { expect, test } from '@playwright/test'
import type { Page, Request } from '@playwright/test'
import { failure, mockApi, ok, paginated, reply } from './helpers/api'
import { INVOICE_SUMMARY, PAID_INVOICE, SENT_INVOICE, me } from './helpers/fixtures'
import { signIn } from './helpers/auth'

/*
 * What the response interceptor in @masaar/api-client does to a live session
 * once its access token expires. The unit tests in src/lib/api-client.test.ts
 * drive the interceptor directly; these cover what only a browser shows — the
 * app's own requests racing each other, the refreshed token reaching
 * localStorage, and where the user ends up when the refresh is refused.
 */

const PAGE = '/app/sales/invoices'
const REFRESHED = 'e2e-refreshed-token'

/** What the API answers a request that still carries the expired token with. */
const EXPIRED = failure('UNAUTHENTICATED', 'Token has expired')

function hasFreshToken(request: Request): boolean {
  return request.headers()['authorization'] === `Bearer ${REFRESHED}`
}

/** Count every refresh attempt; the whole point is that there is exactly one. */
async function countRefreshes(page: Page, granted: boolean): Promise<() => number> {
  let calls = 0
  await mockApi(page, '/auth/refresh', () => {
    calls += 1
    return granted
      ? ok({ token: REFRESHED })
      : reply(401, failure('UNAUTHENTICATED', 'Token cannot be refreshed'))
  })
  return () => calls
}

const token = (page: Page) => page.evaluate(() => localStorage.getItem('erp_token'))

test.describe('An expired token', () => {
  test('is refreshed once and the refused request is replayed', async ({ page }) => {
    await signIn(page)
    const refreshes = await countRefreshes(page, true)
    await mockApi(page, '/sales/invoices/summary', ok(INVOICE_SUMMARY))

    // Only the list refuses the old token, so exactly one request hits a 401.
    const attempts: boolean[] = []
    await mockApi(page, '/sales/invoices', (request) => {
      const fresh = hasFreshToken(request)
      attempts.push(fresh)
      return fresh ? paginated([SENT_INVOICE, PAID_INVOICE]) : reply(401, EXPIRED)
    })

    await page.goto(PAGE)

    await expect(page.getByRole('row').filter({ hasText: SENT_INVOICE.invoice_number })).toBeVisible()
    expect(refreshes()).toBe(1)
    // Refused with the expired token, then replayed with the new one.
    expect(attempts).toEqual([false, true])
    expect(await token(page)).toBe(REFRESHED)
  })

  test('is refreshed once for the requests a page fires together, not once each', async ({ page }) => {
    await signIn(page)
    const refreshes = await countRefreshes(page, true)

    // The invoices page asks for the list and the summary in the same render,
    // so both are in flight with the expired token when the first 401 lands.
    const refused: string[] = []
    const guard = <T>(name: string, body: T) => (request: Request) => {
      if (hasFreshToken(request)) return body
      refused.push(name)
      return reply(401, EXPIRED)
    }
    await mockApi(page, '/sales/invoices/summary', guard('summary', ok(INVOICE_SUMMARY)))
    await mockApi(page, '/sales/invoices', guard('invoices', paginated([SENT_INVOICE, PAID_INVOICE])))

    await page.goto(PAGE)

    // Both were refused, both then succeeded: the rows and the summary tile.
    await expect(page.getByRole('row').filter({ hasText: SENT_INVOICE.invoice_number })).toBeVisible()
    await expect(page.getByText('3,450.00')).toBeVisible()

    expect(refused.sort()).toEqual(['invoices', 'summary'])
    expect(refreshes()).toBe(1)
  })

  test('ends the session when the refresh is refused, and does not keep retrying', async ({ page }) => {
    await signIn(page)
    // The refresh answers 401 itself. Nothing may refresh that refresh: were
    // the interceptor to recurse, this count would run away instead of being 1.
    const refreshes = await countRefreshes(page, false)

    const attempts: string[] = []
    const guard = <T>(name: string, body: T) => (request: Request) => {
      attempts.push(name)
      return hasFreshToken(request) ? body : reply(401, EXPIRED)
    }
    await mockApi(page, '/auth/me', guard('me', ok(me())))
    await mockApi(page, '/sales/invoices/summary', guard('summary', ok(INVOICE_SUMMARY)))
    await mockApi(page, '/sales/invoices', guard('invoices', paginated([SENT_INVOICE, PAID_INVOICE])))

    await page.goto(PAGE)

    // The stored session goes the moment the refresh is refused.
    await expect.poll(() => token(page)).toBeNull()

    // Sent to sign-in by the session ending, without going anywhere first.
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

    // Every request the page had in flight was refused, and not one of those
    // later 401s started a second refresh: a refresh that refreshed itself
    // would run this count away rather than leave it at one.
    expect(attempts.length).toBeGreaterThan(0)
    await page.waitForTimeout(500)
    expect(refreshes()).toBe(1)
  })
})
