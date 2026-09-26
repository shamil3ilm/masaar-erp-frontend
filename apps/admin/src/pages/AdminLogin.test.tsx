/*
 * The console's sign-in form. It is the only screen in the admin app that
 * talks to the backend, so it is tested through the real @masaar/api-client:
 * what it puts on the wire, what it does with each answer, and what it tells
 * the visitor when the answer is a refusal.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { failure, ok, type SentRequest } from '@masaar/test-helpers'
import { AdminLogin } from './AdminLogin'
import { renderConsole, type ConsoleHarness } from '../test/harness'
import { ADMIN_USER, CHALLENGE_TOKEN, LOGIN, PASSWORD, TOKEN } from '../test/fixtures'

let harness: ConsoleHarness

afterEach(() => {
  harness.http.restore()
  localStorage.clear()
})

/** Fill the credentials and submit, the way a visitor reaches the console. */
async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email address'), ADMIN_USER.email)
  // Exact: the field's own "Show password" toggle is labelled too.
  await user.type(screen.getByLabelText('Password', { exact: true }), PASSWORD)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('signing in', () => {
  let onLogin: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onLogin = vi.fn()
  })

  it('posts the credentials and hands the token to the app', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminLogin onLogin={onLogin} />, () => ({ status: 200, body: ok(LOGIN) }))

    await signIn(user)

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(TOKEN))
    expect(harness.http.calls).toHaveLength(1)
    expect(harness.http.calls[0]).toMatchObject<Partial<SentRequest>>({
      method: 'POST',
      url: '/auth/login',
      body: { email: ADMIN_USER.email, password: PASSWORD },
    })
  })

  it('keeps the visitor out and says why when the credentials are refused', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminLogin onLogin={onLogin} />, () => ({
      status: 401,
      body: failure('UNAUTHORIZED', 'These credentials do not match our records.'),
    }))

    await signIn(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('These credentials do not match our records.')
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('falls back to a generic message when the request never reaches the backend', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminLogin onLogin={onLogin} />, () => {
      throw new Error('getaddrinfo ENOTFOUND api.masaar.test')
    })

    await signIn(user)

    // A transport failure carries no status, and its raw message is no use here.
    expect(await screen.findByRole('alert')).toHaveTextContent('Login failed. Please check your credentials.')
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('re-enables the button after a refusal so the visitor can try again', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminLogin onLogin={onLogin} />, () => ({
      status: 401,
      body: failure('UNAUTHORIZED', 'These credentials do not match our records.'),
    }))

    await signIn(user)
    await screen.findByRole('alert')

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })
})

describe('two-step verification', () => {
  it('asks for the one-time code, then exchanges it for a token', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    harness = renderConsole(<AdminLogin onLogin={onLogin} />, (request) =>
      request.url === '/auth/login'
        ? { status: 200, body: ok({ requires_2fa: true, challenge_token: CHALLENGE_TOKEN }) }
        : { status: 200, body: ok(LOGIN) },
    )

    await signIn(user)

    expect(await screen.findByRole('heading', { name: 'Two-step verification' })).toBeVisible()
    // No token yet: the challenge is not a session.
    expect(onLogin).not.toHaveBeenCalled()

    // Surrounding space is what a paste out of an authenticator app carries.
    await user.type(screen.getByLabelText('Verification code'), '  123456  ')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(TOKEN))
    expect(harness.http.calls[1]).toMatchObject<Partial<SentRequest>>({
      method: 'POST',
      url: '/auth/2fa/verify',
      body: { challenge_token: CHALLENGE_TOKEN, code: '123456' },
    })
  })

  it('reports a wrong code and stays on the challenge', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    harness = renderConsole(<AdminLogin onLogin={onLogin} />, (request) =>
      request.url === '/auth/login'
        ? { status: 200, body: ok({ requires_2fa: true, challenge_token: CHALLENGE_TOKEN }) }
        : { status: 422, body: failure('INVALID_CODE', 'That code is not valid.') },
    )

    await signIn(user)
    await user.type(await screen.findByLabelText('Verification code'), '000000')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That code is not valid.')
    expect(screen.getByRole('heading', { name: 'Two-step verification' })).toBeVisible()
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('goes back to the credentials form and drops the code', async () => {
    const user = userEvent.setup()
    harness = renderConsole(<AdminLogin onLogin={vi.fn()} />, (request) =>
      request.url === '/auth/login'
        ? { status: 200, body: ok({ requires_2fa: true, challenge_token: CHALLENGE_TOKEN }) }
        : { status: 200, body: ok(LOGIN) },
    )

    await signIn(user)
    await user.type(await screen.findByLabelText('Verification code'), '123456')
    await user.click(screen.getByRole('button', { name: 'Use a different account' }))

    expect(screen.getByRole('heading', { name: 'Admin sign in' })).toBeVisible()
    expect(screen.queryByLabelText('Verification code')).not.toBeInTheDocument()
  })
})
