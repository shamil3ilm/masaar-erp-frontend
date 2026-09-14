/** A decimal column serialised by Laravel's `decimal:N` cast — it arrives as a string. */
export type Decimal = string

export type CountryCode = 'SA' | 'AE' | 'BH' | 'OM' | 'QA' | 'KW' | 'IN'

export interface Organization {
  id: number
  uuid: string
  name: string
  legal_name: string | null
  tax_number: string | null
  country_code: CountryCode
  base_currency: string
  is_active: boolean
}

export interface Branch {
  id: number
  uuid: string
  name: string
  code: string
  is_default: boolean
  is_active: boolean
}

/** The slim branch summary `/auth/me` returns as `default_branch`. */
export interface BranchSummary {
  id: number
  uuid: string
  name: string
  code: string
}

export interface User {
  id: number
  uuid?: string
  name: string
  email: string
  is_super_admin?: boolean
  two_factor_enabled?: boolean
  // UserResource emits the user's single organization (null for super-admins
  // with none) when the relation is loaded.
  organization?: Organization | null
  branches?: Branch[]
  default_branch?: BranchSummary | null
  roles?: Role[]
}

export interface Role {
  id: number
  name: string
  slug: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta: {
    request_id: string
    timestamp: string
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    request_id: string
    timestamp: string
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface ApiError {
  success: false
  message?: string
  // Present when a ValidationException is thrown (bootstrap/app.php).
  errors?: Record<string, string[]>
  error: {
    code: string
    message: string
    // Field errors from ApiResponse::validationError, or extra context otherwise.
    details?: Record<string, string[] | string>
  }
  meta: {
    request_id: string
    timestamp: string
  }
}

export interface ValidationErrors {
  [field: string]: string
}
