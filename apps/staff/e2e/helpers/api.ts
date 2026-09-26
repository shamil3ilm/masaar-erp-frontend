import type { Page, Request } from '@playwright/test'
import { failure } from '@masaar/test-helpers'

/*
 * The envelopes live in @masaar/test-helpers, where the admin and portal
 * suites build them too. They are re-exported here so a spec still reaches
 * them through the helper it already imports `mockApi` from.
 */
export { failure, ok, paginated } from '@masaar/test-helpers'

/**
 * The app's requests to its API, told apart from the pages it navigates to —
 * `/app/sales/invoices` and `/api/v1/sales/invoices` end in the same path.
 */
function isApiCall(url: URL): boolean {
  return url.pathname.includes('/api/')
}

type JsonBody = unknown

const REPLY = Symbol('reply')

/**
 * A responder's answer when the status has to vary with the request — an
 * expired token gets a 401 where a fresh one gets the body.
 */
export interface Reply {
  readonly [REPLY]: true
  readonly status: number
  readonly body: JsonBody
}

export function reply(status: number, body: JsonBody): Reply {
  return { [REPLY]: true, status, body }
}

function isReply(value: unknown): value is Reply {
  return typeof value === 'object' && value !== null && REPLY in value
}

/** Builds the answer to one request, so a mock can vary with what the app sent. */
export type Responder = (request: Request) => Reply | JsonBody | Promise<Reply | JsonBody>

function isResponder(value: Responder | JsonBody): value is Responder {
  return typeof value === 'function'
}

/**
 * Answer API calls whose path ends in `path`, whatever base URL the app was
 * built with. Later mocks win over earlier ones, so a spec can override a
 * route the sign-in helper already installed.
 */
export async function mockApi(
  page: Page,
  path: string,
  body: Responder | JsonBody,
  status = 200,
): Promise<void> {
  await page.route(
    (url) => isApiCall(url) && url.pathname.endsWith(path),
    async (route) => {
      const answer = isResponder(body) ? await body(route.request()) : body
      const sent = isReply(answer) ? answer : { status, body: answer }
      await route.fulfill({
        status: sent.status,
        contentType: 'application/json',
        body: JSON.stringify(sent.body),
      })
    },
  )
}

/**
 * Refuse every API call the spec has not mocked. Install this first: without
 * it an unmocked call reaches whatever is listening on the API port, and a
 * spec could pass on real data — or hang — instead of failing.
 */
export async function failUnmockedApi(page: Page): Promise<void> {
  await page.route(
    isApiCall,
    (route) =>
      route.fulfill({
        status: 501,
        contentType: 'application/json',
        body: JSON.stringify(
          failure('E2E_UNMOCKED', `Unmocked API call: ${route.request().method()} ${route.request().url()}`),
        ),
      }),
  )
}
