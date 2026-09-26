/*
 * What the console shows a visitor, and what it leaves behind when they go.
 *
 * `AdminApp` is the whole of the app's access control: it holds a token in
 * localStorage and swaps the sign-in page for the console shell on the
 * strength of it. These tests pin that swap in both directions, and pin that
 * signing out takes the session and the cached answers with it.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ok } from '@masaar/test-helpers'
import { AdminApp } from './AdminApp'
import { noApiCalls, renderConsole, TOKEN_KEY, type ConsoleHarness } from './test/harness'
import { ADMIN_USER, LOGIN, PASSWORD, TOKEN } from './test/fixtures'

let harness: ConsoleHarness

afterEach(() => {
  harness.http.restore()
  localStorage.clear()
})

/** The console's own nav, which only the signed-in shell renders. */
const consoleNav = () => screen.queryByRole('button', { name: 'Organizations' })

describe('access to the console', () => {
  it('shows the sign-in page and no console when there is no session', () => {
    harness = renderConsole(<AdminApp />, noApiCalls)

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible()
    expect(consoleNav()).not.toBeInTheDocument()
    expect(harness.http.calls).toEqual([])
  })

  it('opens the console straight away when a session is already stored', () => {
    localStorage.setItem(TOKEN_KEY, TOKEN)

    harness = renderConsole(<AdminApp />, noApiCalls)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    expect(consoleNav()).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument()
  })

  it('stores the session and opens the console once the credentials are accepted', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminApp />, () => ({ status: 200, body: ok(LOGIN) }))

    await user.type(screen.getByLabelText('Email address'), ADMIN_USER.email)
    await user.type(screen.getByLabelText('Password', { exact: true }), PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible()
    expect(localStorage.getItem(TOKEN_KEY)).toBe(TOKEN)
  })

  it('leaves no session behind when the credentials are refused', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminApp />, () => ({ status: 401, body: {} }))

    await user.type(screen.getByLabelText('Email address'), ADMIN_USER.email)
    await user.type(screen.getByLabelText('Password', { exact: true }), 'not-the-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await screen.findByRole('alert')
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(consoleNav()).not.toBeInTheDocument()
  })
})

describe('signing out', () => {
  it('drops the session, the cached answers and the console', async () => {
    const user = userEvent.setup()
    localStorage.setItem(TOKEN_KEY, TOKEN)
    harness = renderConsole(<AdminApp />, noApiCalls)

    // Whatever the console had already fetched for this administrator; the
    // next one to sign in on this machine must not be shown it.
    harness.queryClient.setQueryData(['organizations'], [{ id: 7, name: 'Masaar Trading' }])

    await user.click(screen.getByRole('button', { name: /Administrator/ }))
    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible())
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(harness.queryClient.getQueryData(['organizations'])).toBeUndefined()
    expect(consoleNav()).not.toBeInTheDocument()
  })
})
