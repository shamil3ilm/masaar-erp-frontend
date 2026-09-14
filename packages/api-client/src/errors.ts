import type { ApiError, ValidationErrors } from '@masaar/types'

/** One shape for every failed request, whichever envelope the backend used. */
export interface ApiFailure {
  status: number | null
  code: string | null
  message: string
  fields: ValidationErrors
}

const FALLBACK = 'Something went wrong. Please try again.'

interface ErrorLike {
  message?: unknown
  response?: { status?: number; data?: Partial<ApiError> }
}

function firstMessages(raw: unknown): ValidationErrors {
  const fields: ValidationErrors = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fields
  for (const [field, value] of Object.entries(raw)) {
    const msg = Array.isArray(value) ? value[0] : value
    if (typeof msg === 'string') fields[field] = msg
  }
  return fields
}

/**
 * Normalize an axios error. A 422 carries field errors either as `errors`
 * (a thrown ValidationException) or as `error.details`
 * (ApiResponse::validationError); both become `fields`.
 */
export function parseApiError(err: unknown): ApiFailure {
  const e = (err ?? {}) as ErrorLike
  const status = e.response?.status ?? null
  const data = e.response?.data

  if (!data) {
    return {
      status,
      code: null,
      message: typeof e.message === 'string' && e.message ? e.message : FALLBACK,
      fields: {},
    }
  }

  // `details` is only field errors on a 422; elsewhere it is extra context.
  const fields = data.errors
    ? firstMessages(data.errors)
    : status === 422 ? firstMessages(data.error?.details) : {}

  return {
    status,
    code: data.error?.code ?? null,
    message: data.error?.message ?? data.message ?? FALLBACK,
    fields,
  }
}
