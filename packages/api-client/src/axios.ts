import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios'
import type { ValidationErrors } from '@erp/types'

export type TokenGetter = () => string | null
export type OrgIdGetter = () => string | null
export type LogoutFn = () => void

export function createApiClient(
  baseURL: string,
  getToken?: TokenGetter,
  getOrgId?: OrgIdGetter,
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken?.()
    const orgId = getOrgId?.()
    if (token) config.headers.Authorization = `Bearer ${token}`
    if (orgId) config.headers['X-Organization-Id'] = orgId
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ errors?: Record<string, string[]> }>) => {
      if (error.response?.status === 422 && error.response.data?.errors) {
        const flat: ValidationErrors = {}
        for (const [field, messages] of Object.entries(error.response.data.errors)) {
          flat[field] = messages[0]
        }
        return Promise.reject({ ...error, validationErrors: flat })
      }
      return Promise.reject(error)
    },
  )

  return instance
}

let _client: AxiosInstance | null = null

export function initApiClient(
  baseURL: string,
  getToken: TokenGetter,
  getOrgId: OrgIdGetter,
  onLogout: LogoutFn,
): AxiosInstance {
  _client = createApiClient(baseURL, getToken, getOrgId)

  let isRefreshing = false
  let queue: Array<(token: string) => void> = []

  _client.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      if (error.response?.status === 401 && !original._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            queue.push((token) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(_client!.request(original))
            })
          })
        }
        original._retry = true
        isRefreshing = true
        try {
          const { data } = await _client!.post<{ data: { token: string } }>('/auth/refresh')
          const newToken = data.data.token
          queue.forEach((cb) => cb(newToken))
          queue = []
          original.headers.Authorization = `Bearer ${newToken}`
          return _client!.request(original)
        } catch {
          onLogout()
          return Promise.reject(error)
        } finally {
          isRefreshing = false
        }
      }
      return Promise.reject(error)
    },
  )

  return _client
}

export function getApiClient(): AxiosInstance {
  if (!_client) throw new Error('API client not initialized. Call initApiClient first.')
  return _client
}
