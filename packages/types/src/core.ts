export interface Organization {
  id: string
  name: string
  tax_number: string
  country: 'SA' | 'AE' | 'BH' | 'OM' | 'QA' | 'KW' | 'IN'
  currency: string
  is_active: boolean
}

export interface Branch {
  id: string
  organization_id: string
  name: string
  code: string
  is_active: boolean
}

export interface User {
  id: string
  uuid?: string
  name: string
  email: string
  is_super_admin?: boolean
  // Backend returns the user's organization (null for super-admins with no org)
  // via UserResource when the relation is loaded — not a plural array.
  organization?: Organization | null
  organization_id?: string | null
  roles?: Role[]
  permissions?: string[]
}

export interface Role {
  id: string
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
  error: {
    code: string
    message: string
  }
  meta: {
    request_id: string
    timestamp: string
  }
}

export interface ValidationErrors {
  [field: string]: string
}
