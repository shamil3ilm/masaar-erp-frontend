/*
 * The open-items → allocate flow of @masaar/api-client.
 *
 * No screen drives it yet — nothing imports useOpenItems or useAllocatePayment —
 * so the hooks are the only honest level: what they ask the backend for, the
 * body they post, how the refusal reaches the caller, and which cached balances
 * an allocation drops. The arithmetic itself is the backend's: PaymentService
 * checks each allocation against the locked invoice and returns what is left.
 *
 * Money is compared as the exact strings the API sends, and the posted body as
 * the exact JSON the app puts on the wire, so a float artefact fails the test.
 */
import type { ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios'
import type { ApiError, ApiResponse, OpenItem, PaymentAllocation } from '@masaar/types'
import {
  getApiClient,
  initApiClient,
  parseApiError,
  useAllocatePayment,
  useOpenItems,
  type AllocationResult,
} from '@masaar/api-client'

const CUSTOMER_ID = 5
const PAYMENT_ID = 9

const META = { request_id: 'unit', timestamp: '2026-02-10T09:00:00Z' }

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, message: 'OK', data, meta: META }
}

function failure(code: string, message: string): ApiError {
  return { success: false, message, error: { code, message }, meta: META }
}

function openItem(overrides: Partial<OpenItem> = {}): OpenItem {
  return {
    id: 101,
    uuid: '018f3c2a-9b41-7c55-8d3e-a1a2a3a4a5a6',
    invoice_number: 'INV-2026-0001',
    invoice_date: '2026-01-10',
    due_date: '2026-02-09',
    total: '1150.0000',
    amount_paid: '0.0000',
    amount_due: '1150.0000',
    status: 'sent',
    currency_code: 'SAR',
    ...overrides,
  }
}

const SECOND = openItem({
  id: 102,
  uuid: '018f3c2a-9b41-7c55-8d3e-c1c2c3c4c5c6',
  invoice_number: 'INV-2026-0002',
  invoice_date: '2026-01-20',
  due_date: '2026-02-19',
  total: '2300.0000',
  amount_paid: '300.0000',
  amount_due: '2000.0000',
  status: 'partial',
})

/** One request as it left the app: the raw body, not a re-parsed copy of it. */
interface Sent {
  url: string
  method: string
  params?: unknown
  body: string | undefined
}

type Reply = { status: number; data: unknown }

function setup(handler: (sent: Sent) => Reply) {
  const sent: Sent[] = []
  initApiClient('http://api.test', () => 'token', vi.fn(), vi.fn())

  const adapter: AxiosAdapter = async (config) => {
    const record: Sent = {
      url: config.url ?? '',
      method: (config.method ?? 'get').toLowerCase(),
      params: config.params,
      body: config.data === undefined ? undefined : String(config.data),
    }
    sent.push(record)

    const { status, data } = handler(record)
    const response: AxiosResponse = { data, status, statusText: String(status), headers: {}, config }
    if (status >= 400) throw new AxiosError(`HTTP ${status}`, undefined, config, null, response)
    return response
  }
  getApiClient().defaults.adapter = adapter

  // No retries: a failed request must show up once, as the one call it was.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { sent, queryClient, wrapper }
}

describe('open items', () => {
  it('asks for nothing until a customer is chosen, because the endpoint requires one', async () => {
    const t = setup(() => ({ status: 200, data: ok([]) }))

    const { result } = renderHook(() => useOpenItems(null), { wrapper: t.wrapper })

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(t.sent).toEqual([])
  })

  it("lists the customer's open invoices with the amounts exactly as the backend sent them", async () => {
    const t = setup(() => ({ status: 200, data: ok([openItem(), SECOND]) }))

    const { result } = renderHook(() => useOpenItems(CUSTOMER_ID), { wrapper: t.wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(t.sent).toEqual([
      {
        url: '/sales/payments-received/open-items',
        method: 'get',
        params: { customer_id: CUSTOMER_ID },
        body: undefined,
      },
    ])
    expect(result.current.data?.map((item) => item.amount_due)).toEqual(['1150.0000', '2000.0000'])
    expect(result.current.data?.map((item) => item.amount_paid)).toEqual(['0.0000', '300.0000'])
  })
})

describe('allocating a payment', () => {
  it('posts every allocation as one request and reports what is left unallocated', async () => {
    // A 2,500.00 receipt clears INV-0001 in full and pays 849.75 off INV-0002.
    const allocations: PaymentAllocation[] = [
      { invoice_id: 101, amount: '1150.0000' },
      { invoice_id: 102, amount: '849.7500' },
    ]
    const t = setup(() => ({
      status: 200,
      data: ok<AllocationResult>({ allocations: [], unallocated_amount: 500.25 }),
    }))

    const { result } = renderHook(() => useAllocatePayment(PAYMENT_ID), { wrapper: t.wrapper })
    const allocated = await act(() => result.current.mutateAsync(allocations))

    expect(t.sent).toHaveLength(1)
    expect(t.sent[0]).toMatchObject({ url: `/sales/payments-received/${PAYMENT_ID}/allocate`, method: 'post' })
    // The wire body, byte for byte: the amounts must survive as written.
    expect(t.sent[0].body).toBe(
      '{"allocations":[{"invoice_id":101,"amount":"1150.0000"},{"invoice_id":102,"amount":"849.7500"}]}',
    )
    expect(allocated.unallocated_amount).toBe(500.25)
  })

  it('drops the open items it has cached, so the next read shows the balance that is left', async () => {
    // Before: INV-0002 owes 2,000.0000. After paying 849.75 off it, 1,150.2500.
    const after = openItem({ ...SECOND, amount_paid: '1149.7500', amount_due: '1150.2500' })
    let allocated = false

    const t = setup((sent) => {
      if (sent.url.endsWith('/allocate')) {
        allocated = true
        return { status: 200, data: ok<AllocationResult>({ allocations: [], unallocated_amount: 500.25 }) }
      }
      return { status: 200, data: ok(allocated ? [after] : [openItem(), SECOND]) }
    })

    const items = renderHook(() => useOpenItems(CUSTOMER_ID), { wrapper: t.wrapper })
    await waitFor(() => expect(items.result.current.data).toHaveLength(2))

    const allocate = renderHook(() => useAllocatePayment(PAYMENT_ID), { wrapper: t.wrapper })
    await act(() => allocate.result.current.mutateAsync([{ invoice_id: 102, amount: '849.7500' }]))

    await waitFor(() => expect(items.result.current.data).toEqual([after]))
    expect(items.result.current.data?.[0].amount_due).toBe('1150.2500')
  })

  it('refuses an allocation larger than the invoice owes, with the backend saying by how much', async () => {
    const refusal = 'Allocation amount (1200) exceeds invoice amount due (1150.0000).'
    const t = setup(() => ({ status: 422, data: failure('VALIDATION_ERROR', refusal) }))

    const { result } = renderHook(() => useAllocatePayment(PAYMENT_ID), { wrapper: t.wrapper })
    const error = await act(() =>
      result.current.mutateAsync([{ invoice_id: 101, amount: '1200.0000' }]).catch((err: unknown) => err),
    )

    expect(parseApiError(error)).toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: refusal,
    })
    // One attempt, and nothing was recorded, so the cached open items still stand.
    expect(t.sent).toHaveLength(1)
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
