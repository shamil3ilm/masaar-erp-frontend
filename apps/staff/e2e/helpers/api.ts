import type { Page, Request } from '@playwright/test'
import type { ApiError, ApiResponse, PaginatedResponse } from '@masaar/types'

/** Every envelope the backend sends carries these; nothing in the app reads them. */
function envelopeMeta() {
  return { request_id: 'e2e', timestamp: '2026-02-10T09:00:00Z' }
}

/** The `ApiResponse` envelope a single-resource endpoint answers with. */
export function ok<T>(data: T, message = 'OK'): ApiResponse<T> {
  return { success: true, message, data, meta: envelopeMeta() }
}

/** The `PaginatedResponse` envelope a list endpoint answers with. */
export function paginated<T>(rows: T[], page = 1, perPage = 20): PaginatedResponse<T> {
  return {
    success: true,
    data: rows,
    meta: {
      current_page: page,
      per_page: perPage,
      total: rows.length,
      last_page: Math.max(1, Math.ceil(rows.length / perPage)),
      ...envelopeMeta(),
    },
    links: { first: null, last: null, prev: null, next: null },
  }
}

/** The `ApiError` envelope a failed request answers with. */
export function failure(code: string, message: string): ApiError {
  return { success: false, message, error: { code, message }, meta: envelopeMeta() }
}

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
