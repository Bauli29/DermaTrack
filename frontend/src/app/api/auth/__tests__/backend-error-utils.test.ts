import { EAuthErrorCode } from '@/types/errors'

import { normalizeBackendError, readAuthTokens } from '../backend-error-utils'

const createMockResponse = ({
  status,
  contentType,
  jsonBody,
  textBody = '',
}: {
  status: number
  contentType?: string
  jsonBody?: unknown
  textBody?: string
}): Response =>
  ({
    status,
    headers: {
      get: (name: string) =>
        name === 'content-type' ? (contentType ?? null) : null,
    },
    json: jest.fn().mockImplementation(() => {
      if (jsonBody instanceof Error) {
        return Promise.reject(jsonBody)
      }

      return Promise.resolve(jsonBody)
    }),
    text: jest.fn().mockResolvedValue(textBody),
  }) as unknown as Response

describe('auth backend error utils', () => {
  it('normalizes non-json backend errors with a fallback unknown-error code', async () => {
    const response = createMockResponse({
      status: 503,
      contentType: 'text/plain',
      textBody: 'Service unavailable',
    })

    await expect(normalizeBackendError(response)).resolves.toEqual({
      error: 'Service unavailable',
      code: EAuthErrorCode.UNKNOWN_ERROR,
      statusCode: 503,
    })
  })

  it('normalizes json backend errors through the shared auth parser', async () => {
    const response = createMockResponse({
      status: 409,
      contentType: 'application/json',
      jsonBody: {
        error: 'Email already exists',
        details: ['email: already used'],
      },
    })

    await expect(normalizeBackendError(response)).resolves.toEqual({
      error: 'Email already registered',
      code: EAuthErrorCode.EMAIL_TAKEN,
      statusCode: 409,
      details: ['email: already used'],
    })
  })

  it('falls back safely when a json backend error body cannot be parsed', async () => {
    const response = createMockResponse({
      status: 500,
      contentType: 'application/json',
      jsonBody: new SyntaxError('Unexpected token'),
    })

    await expect(normalizeBackendError(response)).resolves.toEqual({
      error: 'An error occurred',
      code: EAuthErrorCode.SERVER_ERROR,
      statusCode: 500,
      details: undefined,
    })
  })

  it('reads auth tokens from json responses and returns null on invalid payloads', async () => {
    const validResponse = createMockResponse({
      status: 200,
      contentType: 'application/json',
      jsonBody: {
        accessToken: 'access',
        refreshToken: 'refresh',
      },
    })
    const invalidResponse = createMockResponse({
      status: 200,
      contentType: 'application/json',
      jsonBody: new SyntaxError('Unexpected token'),
    })

    await expect(readAuthTokens(validResponse)).resolves.toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
    await expect(readAuthTokens(invalidResponse)).resolves.toBeNull()
  })
})
