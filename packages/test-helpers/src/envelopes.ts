import type { ApiError, ApiResponse, PaginatedResponse } from '@masaar/types'

/**
 * The envelopes the backend wraps every answer in. Building them here — typed
 * against @masaar/types — means a contract change fails the typecheck of every
 * suite that sends one, instead of passing against a stale hand-written shape.
 */

/** Every envelope carries these; no app reads them. */
function envelopeMeta() {
  return { request_id: 'test', timestamp: '2026-02-10T09:00:00Z' }
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
