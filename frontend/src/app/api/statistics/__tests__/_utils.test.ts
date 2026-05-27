import { secureFetch } from '@/lib/backend-client'
import { validateRequestOrThrow } from '@/lib/validation-helper'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

import {
  buildStatisticsBackendPath,
  createStatisticsRequestErrorResponse,
  forwardStatisticsResponse,
  proxyStatisticsRequest,
} from '../_utils'

jest.mock('@/lib/backend-client', () => ({
  secureFetch: jest.fn(),
}))

jest.mock('@/lib/validation-helper', () => {
  const actual = jest.requireActual('@/lib/validation-helper')

  return {
    ...actual,
    validateRequestOrThrow: jest.fn(actual.validateRequestOrThrow),
  }
})

const mockedSecureFetch = jest.mocked(secureFetch)
const mockedValidateRequestOrThrow = jest.mocked(validateRequestOrThrow)

type THeaderPair = [string, string]

const toHeaderPairs = (headers?: HeadersInit): THeaderPair[] => {
  if (!headers) {
    return []
  }

  if (Array.isArray(headers)) {
    return headers.map(([key, value]) => [key, value])
  }

  return Object.entries(headers)
}

class MockResponse {
  readonly headers: { get: (name: string) => string | null }
  readonly ok: boolean
  readonly status: number

  private readonly body: string

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    const headerMap = new Map(
      toHeaderPairs(init?.headers).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ])
    )

    this.status = init?.status ?? 200
    this.ok = this.status >= 200 && this.status < 300
    this.headers = {
      get: (name: string) => headerMap.get(name.toLowerCase()) ?? null,
    }
    if (typeof body === 'string') {
      this.body = body
    } else if (body === null || body === undefined) {
      this.body = ''
    } else {
      this.body = String(body)
    }
  }

  static json(data: unknown, init?: ResponseInit): MockResponse {
    const headers = {
      'content-type': 'application/json',
      ...Object.fromEntries(toHeaderPairs(init?.headers)),
    }

    return new MockResponse(JSON.stringify(data), { ...init, headers })
  }

  json(): Promise<unknown> {
    try {
      return Promise.resolve(this.body ? JSON.parse(this.body) : null)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  text(): Promise<string> {
    return Promise.resolve(this.body)
  }
}

if (typeof globalThis.Response === 'undefined') {
  Object.defineProperty(globalThis, 'Response', {
    configurable: true,
    value: MockResponse,
  })
}

const createRequest = (
  url: string,
  accessToken?: string
): Parameters<typeof proxyStatisticsRequest>[0] =>
  ({
    nextUrl: new URL(url),
    cookies: {
      get: jest.fn(name =>
        name === AUTH_COOKIE_NAMES.ACCESS_TOKEN && accessToken
          ? { value: accessToken }
          : undefined
      ),
    },
  }) as unknown as Parameters<typeof proxyStatisticsRequest>[0]

describe('statistics api utils', () => {
  beforeEach(() => {
    mockedSecureFetch.mockReset()
    mockedValidateRequestOrThrow.mockClear()
  })

  it('builds backend paths with supported query parameters', () => {
    expect(buildStatisticsBackendPath('symptoms')).toBe(
      '/api/statistics/symptoms'
    )
    expect(
      buildStatisticsBackendPath('psyche-symptoms', '2026-05-01', '2026-05-27')
    ).toBe(
      '/api/statistics/psyche-symptoms?startDate=2026-05-01&endDate=2026-05-27'
    )
    expect(
      buildStatisticsBackendPath(
        'correlation',
        '2026-05-01',
        undefined,
        'nutrition'
      )
    ).toBe(
      '/api/statistics/correlation?startDate=2026-05-01&mainCategory=nutrition'
    )
    expect(
      buildStatisticsBackendPath('symptoms', undefined, undefined, 'nutrition')
    ).toBe('/api/statistics/symptoms')
  })

  it('forwards JSON, text error and empty success payloads consistently', async () => {
    const success = await forwardStatisticsResponse(
      new Response(JSON.stringify({ symptoms: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
      'fallback'
    )
    const textError = await forwardStatisticsResponse(
      new Response('Statistics unavailable', { status: 503 }),
      'fallback'
    )
    const emptySuccess = await forwardStatisticsResponse(
      new Response('', { status: 204 }),
      'fallback'
    )

    await expect(success.json()).resolves.toEqual({ symptoms: [] })
    await expect(textError.json()).resolves.toEqual({
      error: 'Statistics unavailable',
    })
    await expect(emptySuccess.json()).resolves.toEqual({})
    expect(success.status).toBe(200)
    expect(textError.status).toBe(503)
    expect(emptySuccess.status).toBe(204)
  })

  it('validates query parameters and proxies authorized statistics requests', async () => {
    const backendResponse = new Response(JSON.stringify({ ok: true }), {
      status: 200,
    })
    mockedSecureFetch.mockResolvedValueOnce(backendResponse)

    const response = await proxyStatisticsRequest(
      createRequest(
        'http://localhost/api/statistics/correlation?startDate=2026-05-01&endDate=2026-05-27&mainCategory=nutrition',
        'access-token'
      ),
      'correlation'
    )

    expect(response).toBe(backendResponse)
    expect(mockedValidateRequestOrThrow).toHaveBeenCalledTimes(3)
    expect(mockedSecureFetch).toHaveBeenCalledWith(
      '/api/statistics/correlation?startDate=2026-05-01&endDate=2026-05-27&mainCategory=nutrition',
      {
        method: 'GET',
        cache: 'no-store',
        headers: { Authorization: 'Bearer access-token' },
      }
    )
  })

  it('maps validation and unexpected request errors to API responses', async () => {
    let validationError: unknown

    try {
      await proxyStatisticsRequest(
        createRequest(
          'http://localhost/api/statistics/symptoms?startDate=2026-02-31'
        ),
        'symptoms'
      )
    } catch (error) {
      validationError = error
    }

    const badRequest = createStatisticsRequestErrorResponse(validationError)
    const serverError = createStatisticsRequestErrorResponse(new Error('boom'))

    expect(badRequest.status).toBe(400)
    await expect(badRequest.json()).resolves.toMatchObject({
      error: 'Validation failed',
    })
    expect(serverError.status).toBe(500)
    await expect(serverError.json()).resolves.toEqual({
      error: 'Internal server error while fetching statistics',
    })
  })
})
