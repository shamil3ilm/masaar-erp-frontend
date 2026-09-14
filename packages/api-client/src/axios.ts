import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import type { ApiResponse } from '@masaar/types'

export type TokenGetter = () => string | null
export type TokenSetter = (token: string) => void
export type LogoutFn = () => void

export const REFRESH_URL = '/auth/refresh'

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export function createApiClient(baseURL: string, getToken?: TokenGetter): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken?.()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  return instance
}

let _client: AxiosInstance | null = null

/**
 * Create the shared client. On a 401 it refreshes the token once, saves the new
 * token through `setToken` (the backend blacklists the old one), and retries.
 * Concurrent 401s share the one refresh; if it fails they all reject and
 * `onLogout` runs.
 */
export function initApiClient(
  baseURL: string,
  getToken: TokenGetter,
  setToken: TokenSetter,
  onLogout: LogoutFn,
): AxiosInstance {
  const client = createApiClient(baseURL, getToken)
  _client = client

  let refreshing: Promise<string> | null = null

  function refresh(): Promise<string> {
    refreshing ??= client
      .post<ApiResponse<{ token: string }>>(REFRESH_URL)
      .then(({ data }) => {
        setToken(data.data.token)
        return data.data.token
      })
      .catch((err: unknown) => {
        onLogout()
        throw err
      })
      .finally(() => {
        refreshing = null
      })
    return refreshing
  }

  client.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const original = error.config as RetryConfig | undefined
      const current = getToken()

      // The refresh call's own 401 must fail outright: retrying it would wait on itself.
      if (
        error.response?.status !== 401 ||
        !original ||
        original._retry ||
        original.url === REFRESH_URL ||
        !current
      ) {
        return Promise.reject(error)
      }

      original._retry = true

      // Sent with a token that has since been replaced: retry with the new one.
      if (original.headers.Authorization !== `Bearer ${current}`) {
        original.headers.Authorization = `Bearer ${current}`
        return client.request(original)
      }

      try {
        const token = await refresh()
        original.headers.Authorization = `Bearer ${token}`
      } catch {
        return Promise.reject(error)
      }
      return client.request(original)
    },
  )

  return client
}

export function getApiClient(): AxiosInstance {
  if (!_client) throw new Error('API client not initialized. Call initApiClient first.')
  return _client
}
