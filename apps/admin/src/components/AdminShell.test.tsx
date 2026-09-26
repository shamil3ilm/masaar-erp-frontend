/*
 * The console shell's navigation. There is no router: `view` is a piece of
 * state and the sidebar swaps what the main region renders, so the nav and the
 * screen it opens can only be checked together.
 *
 * The shell reaches no endpoint — every screen behind it is either a
 * placeholder or the hard-coded reference dashboard — so each test also
 * asserts the API stayed untouched.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminShell } from './AdminShell'
import { noApiCalls, renderConsole, type ConsoleHarness } from '../test/harness'

let harness: ConsoleHarness

afterEach(() => {
  harness.http.restore()
  localStorage.clear()
})

/** Every management screen the sidebar offers, and the blurb it opens with. */
const PLACEHOLDERS = [
  ['Organizations', 'Manage tenant organizations across the platform.'],
  ['Users', 'Manage system users and their access.'],
  ['Modules', 'Configure which modules each organization can access.'],
  ['Audit Log', 'Review platform-wide activity and changes.'],
  ['Settings', 'Configure global platform settings.'],
] as const

describe('the console shell', () => {
  it('opens on the dashboard', () => {
    harness = renderConsole(<AdminShell onLogout={vi.fn()} />, noApiCalls)

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()
    expect(harness.http.calls).toEqual([])
  })

  it.each(PLACEHOLDERS)('opens %s from the sidebar', async (label, description) => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminShell onLogout={vi.fn()} />, noApiCalls)

    await user.click(screen.getByRole('button', { name: label }))

    expect(screen.getByRole('heading', { level: 1, name: label })).toBeVisible()
    // Nothing behind these screens is built yet; they say so rather than
    // showing an empty table that looks like a tenant with no data.
    expect(screen.getByRole('heading', { name: `${label} — coming soon` })).toBeVisible()
    expect(screen.getByText(description)).toBeVisible()
    expect(harness.http.calls).toEqual([])
  })

  it('shows the profile and support screens the shared UI provides', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminShell onLogout={vi.fn()} />, noApiCalls)

    await user.click(screen.getByRole('button', { name: 'Profile' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Help & support' }))
    expect(screen.getByRole('heading', { level: 1, name: /support/i })).toBeVisible()
    expect(harness.http.calls).toEqual([])
  })

  it('leaves the dashboard behind when another screen is chosen', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminShell onLogout={vi.fn()} />, noApiCalls)

    await user.click(screen.getByRole('button', { name: 'Users' }))

    expect(screen.queryByRole('heading', { level: 1, name: 'Dashboard' })).not.toBeInTheDocument()
  })

  it('signs out from the top bar', async () => {
    const user = userEvent.setup()
    const onLogout = vi.fn()
    harness = renderConsole(<AdminShell onLogout={onLogout} />, noApiCalls)

    await user.click(screen.getByRole('button', { name: /Administrator/ }))
    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('signs out from the profile screen', async () => {
    const user = userEvent.setup()
    const onLogout = vi.fn()
    harness = renderConsole(<AdminShell onLogout={onLogout} />, noApiCalls)

    await user.click(screen.getByRole('button', { name: 'Profile' }))
    await user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
