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

/** Builds the body for one request, so a mock can vary with what the app sent. */
export type Responder = (request: Request) => JsonBody | Promise<JsonBody>

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
      const payload = isResponder(body) ? await body(route.request()) : body
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(payload),
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
