/*
 * Tests for @masaar/api-client. The package has no test runner of its own, so
 * they run under this app's Vitest, which already resolves the workspace package.
 */
import { describe, it, expect, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { initApiClient, parseApiError, REFRESH_URL } from '@masaar/api-client'

type Reply = { status: number; data?: unknown }

function setup(handler: (config: InternalAxiosRequestConfig) => Reply, initial: string | null = 'old') {
  let token = initial
  const calls: string[] = []
  const setToken = vi.fn((t: string) => { token = t })
  const onLogout = vi.fn(() => { token = null })
  const client = initApiClient('http://api.test', () => token, setToken, onLogout)

  const adapter: AxiosAdapter = async (config) => {
    calls.push(config.url ?? '')
    const { status, data = {} } = handler(config)
    const response: AxiosResponse = { data, status, statusText: String(status), headers: {}, config }
    if (status >= 400) throw new AxiosError(`HTTP ${status}`, undefined, config, null, response)
    return response
  }
  client.defaults.adapter = adapter

  return { client, setToken, onLogout, calls, token: () => token }
}

const auth = (config: InternalAxiosRequestConfig) => String(config.headers.Authorization)

describe('token refresh', () => {
  it('refreshes once, persists the new token and retries with it', async () => {
    const t = setup((config) => {
      if (config.url === REFRESH_URL) return { status: 200, data: { data: { token: 'new' } } }
      return auth(config) === 'Bearer new' ? { status: 200, data: { ok: true } } : { status: 401 }
    })

    const res = await t.client.get('/sales/invoices')

    expect(res.data).toEqual({ ok: true })
    expect(t.setToken).toHaveBeenCalledWith('new')
    expect(t.token()).toBe('new')
    expect(t.calls.filter((u) => u === REFRESH_URL)).toHaveLength(1)
  })

  it('shares one refresh between concurrent 401s', async () => {
    const t = setup((config) => {
      if (config.url === REFRESH_URL) return { status: 200, data: { data: { token: 'new' } } }
      return auth(config) === 'Bearer new' ? { status: 200, data: config.url } : { status: 401 }
    })

    const [a, b] = await Promise.all([t.client.get('/a'), t.client.get('/b')])

    expect([a.data, b.data]).toEqual(['/a', '/b'])
    expect(t.calls.filter((u) => u === REFRESH_URL)).toHaveLength(1)
  })

  it('rejects every waiting request and logs out when the refresh itself returns 401', async () => {
    const t = setup(() => ({ status: 401 }))

    const results = await Promise.allSettled([t.client.get('/a'), t.client.get('/b')])

    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected'])
    expect(t.onLogout).toHaveBeenCalledTimes(1)
    expect(t.setToken).not.toHaveBeenCalled()
    expect(t.calls.filter((u) => u === REFRESH_URL)).toHaveLength(1)
  })

  it('does not try to refresh the refresh request', async () => {
    const t = setup(() => ({ status: 401 }))

    await expect(t.client.post(REFRESH_URL)).rejects.toBeInstanceOf(AxiosError)
    expect(t.calls).toEqual([REFRESH_URL])
  })

  it('does not refresh when there is no token, e.g. a failed login', async () => {
    const t = setup(() => ({ status: 401 }), null)

    await expect(t.client.post('/auth/login')).rejects.toBeInstanceOf(AxiosError)
    expect(t.calls).toEqual(['/auth/login'])
    expect(t.onLogout).not.toHaveBeenCalled()
  })
})

function failure(status: number, data: unknown) {
  return new AxiosError('Request failed', undefined, undefined, null, {
    status, data, statusText: '', headers: {}, config: {} as InternalAxiosRequestConfig,
  })
}

describe('parseApiError', () => {
  it('reads field errors from a thrown ValidationException (`errors`)', () => {
    const err = failure(422, {
      success: false,
      message: 'The customer id field is required.',
      errors: { customer_id: ['The customer id field is required.'], 'lines.0.quantity': ['Too small.', 'Other'] },
      error: { code: 'VALIDATION_ERROR', message: 'The given data was invalid.' },
    })

    expect(parseApiError(err)).toEqual({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'The given data was invalid.',
      fields: { customer_id: 'The customer id field is required.', 'lines.0.quantity': 'Too small.' },
    })
  })

  it('reads field errors from ApiResponse::validationError (`error.details`)', () => {
    const err = failure(422, {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The given data was invalid.',
        details: { credit_note_type: ['The credit note type field is required.'] },
      },
    })

    expect(parseApiError(err).fields).toEqual({ credit_note_type: 'The credit note type field is required.' })
  })

  it('does not treat non-validation details as field errors', () => {
    const err = failure(400, {
      success: false,
      error: { code: 'BIZ_INVALID_STATUS_TRANSITION', message: 'Invalid transition', details: { current_status: 'paid' } },
    })

    expect(parseApiError(err)).toMatchObject({ status: 400, message: 'Invalid transition', fields: {} })
  })

  it('falls back to the transport message when there is no response', () => {
    expect(parseApiError(new AxiosError('Network Error'))).toMatchObject({
      status: null,
      message: 'Network Error',
      fields: {},
    })
  })
})
