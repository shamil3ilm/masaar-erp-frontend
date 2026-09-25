import { expect, test } from '@playwright/test'
import type { ZatcaOnboardingStatus } from '@masaar/types'
import { failure, mockApi, ok } from './helpers/api'
import { DEFAULT_BRANCH, me, onboarding } from './helpers/fixtures'
import { signIn } from './helpers/auth'

const PAGE = '/app/compliance/zatca/onboarding'

/* The compliance routes address a branch by uuid, which only /auth/me carries. */
const BRANCH = `/compliance/branches/${DEFAULT_BRANCH.uuid}/onboarding`

test.describe('ZATCA onboarding', () => {
  test('walks a branch from no certificate to the production network', async ({ page }) => {
    await signIn(page)

    let status: ZatcaOnboardingStatus | null = null
    await mockApi(page, `${BRANCH}/status`, () => ok(onboarding(status)))

    let ccsidRequest: unknown = null
    await mockApi(page, `${BRANCH}/ccsid`, (request) => {
      ccsidRequest = request.postDataJSON()
      status = 'ccsid_issued'
      return ok(onboarding(status))
    })
    await mockApi(page, `${BRANCH}/compliance-check`, () => {
      status = 'compliance_checked'
      return ok(onboarding(status))
    })
    await mockApi(page, `${BRANCH}/pcsid`, () => {
      status = 'pcsid_issued'
      return ok(onboarding(status))
    })

    await page.goto(PAGE)
    await expect(page.getByRole('heading', { name: 'ZATCA Onboarding' })).toBeVisible()

    // Step 1 — the CSR is posted as JSON, not as the text the operator pasted.
    await page.getByPlaceholder(/enter otp/i).fill('554433')
    await page.getByPlaceholder(/csr/i).fill('{"csr":"LS0tLS1CRUdJTg=="}')
    await page.getByRole('button', { name: 'Request CCSID' }).click()

    // Step 2 — the wizard only offers the next action once the certificate exists.
    await page.getByRole('button', { name: 'Run Compliance Check' }).click()

    // Step 3
    await page.getByRole('button', { name: 'Upgrade to Production (PCSID)' }).click()

    await expect(page.getByText('Onboarding Complete')).toBeVisible()
    await expect(page.getByText('This branch is active on the ZATCA production network.')).toBeVisible()
    expect(ccsidRequest).toEqual({ otp: '554433', csr: { csr: 'LS0tLS1CRUdJTg==' } })
  })

  test('says so when the user has no default branch to onboard', async ({ page }) => {
    await signIn(page, me({ default_branch: null }))

    await page.goto(PAGE)

    await expect(
      page.getByText('Your account is not assigned to a branch, so there is nothing to onboard.'),
    ).toBeVisible()
  })

  test('reports a failure to read the onboarding status', async ({ page }) => {
    await signIn(page)
    await mockApi(page, `${BRANCH}/status`, failure('SERVER_ERROR', 'Something went wrong.'), 500)

    await page.goto(PAGE)

    await expect(page.getByText('Failed to load onboarding status.')).toBeVisible()
  })
})
