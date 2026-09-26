import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderResult } from '@testing-library/react'
import { initApiClient } from '@masaar/api-client'
import { ThemeProvider } from '@masaar/ui'
import { failure, stubHttp, type HttpStub, type StubHandler } from '@masaar/test-helpers'

/** The key `main.tsx` keeps the console's session under. */
export const TOKEN_KEY = 'admin_token'

export interface ConsoleHarness extends RenderResult {
  http: HttpStub
  queryClient: QueryClient
}

/**
 * Mount a piece of the console wired the way `main.tsx` wires it: one shared
 * API client reading the session out of localStorage, under a QueryClient and
 * the theme provider the shell's toggles read from.
 *
 * The API is stubbed before the client is built, because a client snapshots
 * the adapter from axios' defaults when it is created. Retries are off so a
 * stubbed refusal reaches the screen on the first attempt.
 */
export function renderConsole(ui: ReactElement, handler: StubHandler): ConsoleHarness {
  const http = stubHttp(handler)
  initApiClient(
    '/api/v1',
    () => localStorage.getItem(TOKEN_KEY),
    (token) => localStorage.setItem(TOKEN_KEY, token),
    () => localStorage.removeItem(TOKEN_KEY),
  )

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const result = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">{ui}</ThemeProvider>
    </QueryClientProvider>,
  )

  return { ...result, http, queryClient }
}

/**
 * Refuse every call, so a screen that is supposed to reach no endpoint fails
 * visibly rather than passing on whatever a stray stub happened to answer.
 * Pair it with an assertion that `http.calls` stayed empty.
 */
export const noApiCalls: StubHandler = () => ({
  status: 501,
  body: failure('UNSTUBBED', 'This screen was not expected to call the API.'),
})
