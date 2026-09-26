import axios, { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios'

/** One request as the app sent it. */
export interface SentRequest {
  method: string
  /** The path the caller asked for, without the client's base URL. */
  url: string
  /** The JSON body, already parsed back from what went on the wire. */
  body: unknown
  authorization: string | null
}

/** What the stub answers one request with. */
export interface StubReply {
  status: number
  body?: unknown
}

export type StubHandler = (request: SentRequest) => StubReply | Promise<StubReply>

export interface HttpStub {
  /** Every request the app made, in order. */
  readonly calls: readonly SentRequest[]
  /** Put the real adapter back; call it from `afterEach`. */
  restore(): void
}

function parseBody(data: unknown): unknown {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

/**
 * Answer every axios request in this process with `handler`, so a unit test
 * drives a component through the real @masaar/api-client — its Authorization
 * header, its envelope unwrapping and its error shape — with no server.
 *
 * The adapter goes on axios' own defaults, which every client created
 * afterwards inherits; that reaches the shared client `initApiClient` builds
 * and the one-off clients `createApiClient` builds for a single token.
 */
export function stubHttp(handler: StubHandler): HttpStub {
  const previous = axios.defaults.adapter
  const calls: SentRequest[] = []

  const adapter: AxiosAdapter = async (config) => {
    const authorization = config.headers.Authorization
    const sent: SentRequest = {
      method: (config.method ?? 'get').toUpperCase(),
      url: config.url ?? '',
      body: parseBody(config.data),
      authorization: typeof authorization === 'string' ? authorization : null,
    }
    calls.push(sent)

    const { status, body = {} } = await handler(sent)
    const response: AxiosResponse = {
      data: body,
      status,
      statusText: String(status),
      headers: {},
      config,
    }
    // Axios rejects on a 4xx/5xx, and the app's error handling reads the
    // response off the AxiosError rather than off a resolved promise.
    if (status >= 400) throw new AxiosError(`HTTP ${status}`, undefined, config, null, response)
    return response
  }

  axios.defaults.adapter = adapter

  return {
    calls,
    restore() {
      axios.defaults.adapter = previous
    },
  }
}
