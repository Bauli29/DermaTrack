import { EAuthErrorCode } from '@/types/errors'

import {
  AUTH_API_PATHS,
  loadSession,
  loadSessionWithRefresh,
  requestAuth,
} from '../api'

const createMockResponse = ({
  status,
  ok = status >= 200 && status < 300,
  jsonBody,
}: {
  status: number
  ok?: boolean
  jsonBody?: unknown
}): Response =>
  ({
    ok,
    status,
    json: jest.fn().mockImplementation(() => {
      if (jsonBody instanceof Error) {
        return Promise.reject(jsonBody)
      }

      return Promise.resolve(jsonBody)
    }),
  }) as unknown as Response

describe('auth api helpers', () => {
  it('requests auth routes with json headers and credentials', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        jsonBody: { refreshed: true },
      })
    )

    await expect(
      requestAuth<{ refreshed: boolean }>(
        AUTH_API_PATHS.REFRESH,
        { method: 'POST' },
        fetchImpl
      )
    ).resolves.toEqual({ refreshed: true })

    expect(fetchImpl).toHaveBeenCalledWith(AUTH_API_PATHS.REFRESH, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('returns an empty object for 204 auth responses', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 204,
        jsonBody: null,
      })
    )

    await expect(
      requestAuth(AUTH_API_PATHS.LOGOUT, { method: 'POST' }, fetchImpl)
    ).resolves.toEqual({})
  })

  it('parses auth api errors into structured auth errors', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 401,
        ok: false,
        jsonBody: { error: 'Invalid credentials' },
      })
    )

    await expect(
      requestAuth(AUTH_API_PATHS.LOGIN, { method: 'POST' }, fetchImpl)
    ).rejects.toMatchObject({
      code: EAuthErrorCode.INVALID_CREDENTIALS,
      message: 'Incorrect email or password',
      statusCode: 401,
    })
  })

  it('uses normalized auth error codes returned by frontend auth routes', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 401,
        ok: false,
        jsonBody: {
          code: EAuthErrorCode.REFRESH_FAILED,
          error: 'Refresh failed',
          statusCode: 401,
          details: 'Refresh token expired',
        },
      })
    )

    await expect(
      requestAuth(AUTH_API_PATHS.REFRESH, { method: 'POST' }, fetchImpl)
    ).rejects.toMatchObject({
      code: EAuthErrorCode.REFRESH_FAILED,
      message: 'Refresh failed',
      statusCode: 401,
      details: { details: 'Refresh token expired' },
    })
  })

  it('falls back to an unknown auth error when the response body cannot be parsed', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 500,
        ok: false,
        jsonBody: new Error('invalid json'),
      })
    )

    await expect(
      requestAuth(AUTH_API_PATHS.LOGIN, { method: 'POST' }, fetchImpl)
    ).rejects.toMatchObject({
      code: EAuthErrorCode.UNKNOWN_ERROR,
      message: 'Authentication request failed',
      statusCode: 500,
    })
  })

  it('preserves custom headers while adding json defaults', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        jsonBody: { accessToken: 'access', refreshToken: 'refresh' },
      })
    )

    await requestAuth(
      AUTH_API_PATHS.LOGIN,
      {
        method: 'POST',
        headers: {
          'X-Test': 'yes',
        },
      },
      fetchImpl
    )

    expect(fetchImpl).toHaveBeenCalledWith(AUTH_API_PATHS.LOGIN, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Test': 'yes',
      },
    })
  })

  it('retries the session fetch after a successful refresh', async () => {
    const fetchSession = jest
      .fn()
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          ok: false,
          jsonBody: { isLoggedIn: false, user: null },
        })
      )
      .mockResolvedValueOnce(
        createMockResponse({
          status: 200,
          jsonBody: {
            isLoggedIn: true,
            user: { id: '', username: 'alice', email: '', createdAt: '' },
          },
        })
      )
    const refreshSession = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        jsonBody: { refreshed: true },
      })
    )

    await expect(
      loadSessionWithRefresh(fetchSession, refreshSession)
    ).resolves.toEqual({
      isLoggedIn: true,
      user: { id: '', username: 'alice', email: '', createdAt: '' },
    })

    expect(fetchSession).toHaveBeenCalledTimes(2)
    expect(refreshSession).toHaveBeenCalledTimes(1)
  })

  it('returns null when refresh does not restore the session', async () => {
    const fetchSession = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 401,
        ok: false,
        jsonBody: { isLoggedIn: false, user: null },
      })
    )
    const refreshSession = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 401,
        ok: false,
        jsonBody: { error: 'Refresh failed' },
      })
    )

    await expect(
      loadSessionWithRefresh(fetchSession, refreshSession)
    ).resolves.toBeNull()
  })

  it('returns null when refresh succeeds but the session remains unavailable', async () => {
    const fetchSession = jest
      .fn()
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          ok: false,
          jsonBody: { isLoggedIn: false, user: null },
        })
      )
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          ok: false,
          jsonBody: { isLoggedIn: false, user: null },
        })
      )
    const refreshSession = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 204,
        jsonBody: null,
      })
    )

    await expect(
      loadSessionWithRefresh(fetchSession, refreshSession)
    ).resolves.toBeNull()

    expect(fetchSession).toHaveBeenCalledTimes(2)
    expect(refreshSession).toHaveBeenCalledTimes(1)
  })

  it('uses the shared fetch wrapper for the standard session-loading flow', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        jsonBody: { isLoggedIn: false, user: null },
      })
    )

    await expect(loadSession(fetchImpl)).resolves.toEqual({
      isLoggedIn: false,
      user: null,
    })

    expect(fetchImpl).toHaveBeenCalledWith(AUTH_API_PATHS.SESSION, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
    })
  })
})
