import { validateRequestOrThrow } from '@/lib/validation-helper'

import { DiaryEntrySchema } from '@/validation/diary'

import {
  buildDiaryBackendPath,
  buildDiaryHeaders,
  createDiaryMutationErrorResponse,
  forwardDiaryResponse,
} from '../_utils'

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

describe('diary api utils', () => {
  it('builds diary backend paths consistently', () => {
    expect(buildDiaryBackendPath()).toBe('/api/diary')
    expect(buildDiaryBackendPath('entry-123')).toBe('/api/diary/entry-123')
    expect(buildDiaryBackendPath(undefined, 'fromDate=2026-04-01')).toBe(
      '/api/diary?fromDate=2026-04-01'
    )
    expect(buildDiaryBackendPath('by-date', '?date=2026-04-23')).toBe(
      '/api/diary/by-date?date=2026-04-23'
    )
  })

  it('adds authorization headers only when an access token is present', () => {
    expect(buildDiaryHeaders()).toEqual({})
    expect(buildDiaryHeaders('token-123')).toEqual({
      Authorization: 'Bearer token-123',
    })
  })

  it('forwards successful JSON responses unchanged', async () => {
    const response = new Response(JSON.stringify({ id: '1', symptoms: 4 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })

    const forwarded = await forwardDiaryResponse(response, 'fallback')

    await expect(forwarded.json()).resolves.toEqual({ id: '1', symptoms: 4 })
    expect(forwarded.status).toBe(200)
  })

  it('falls back to the configured error message when backend JSON is invalid', async () => {
    const response = new Response('not-json', {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })

    const forwarded = await forwardDiaryResponse(
      response,
      'Failed to fetch diary entry'
    )

    await expect(forwarded.json()).resolves.toEqual({
      error: 'Failed to fetch diary entry',
    })
    expect(forwarded.status).toBe(502)
  })

  it('maps validation and parsing failures to request error responses', async () => {
    let validationError: unknown

    try {
      validateRequestOrThrow(DiaryEntrySchema, {})
    } catch (error) {
      validationError = error
    }

    const badRequest = createDiaryMutationErrorResponse(
      validationError,
      'creating'
    )
    const invalidJson = createDiaryMutationErrorResponse(
      new SyntaxError('Unexpected token'),
      'updating'
    )

    const validationBody = (await badRequest.json()) as {
      error: string
      details: string[]
    }

    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON in request body',
    })
    expect(badRequest.status).toBe(400)
    expect(validationBody.error).toBe('Validation failed')
    expect(validationBody.details[0]).toContain('entryDate:')
    expect(invalidJson.status).toBe(400)
  })
})
