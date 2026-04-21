'use client'

import { createAuthError, EAuthErrorCode, parseApiError } from '@/types/errors'

import type { ISessionResponse } from '@/types/auth'
import type { IApiErrorResponse, IAuthError } from '@/types/errors'

type TAuthFetch = (input: string, init?: RequestInit) => Promise<Response>

export const AUTH_API_PATHS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  REGISTER: '/api/auth/register',
  SESSION: '/api/auth/session',
} as const

const fetchAuthRoute = (
  path: string,
  options: RequestInit,
  fetchImpl: TAuthFetch = fetch
): Promise<Response> =>
  fetchImpl(path, {
    ...options,
    credentials: 'include',
  })

const readJsonResponse = async <T>(response: Response): Promise<T | null> =>
  (await response.json().catch(() => null)) as T | null

const parseResponseError = async (response: Response): Promise<IAuthError> => {
  const fallbackMessage = 'Authentication request failed'
  const body = await readJsonResponse<IApiErrorResponse>(response)

  if (body) {
    return parseApiError(body, response.status)
  }

  return createAuthError(
    EAuthErrorCode.UNKNOWN_ERROR,
    fallbackMessage,
    response.status
  )
}

export const requestAuth = async <T>(
  path: string,
  options: RequestInit,
  fetchImpl: TAuthFetch = fetch
): Promise<T> => {
  const response = await fetchAuthRoute(
    path,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    },
    fetchImpl
  )

  if (!response.ok) {
    throw await parseResponseError(response)
  }

  if (response.status === 204) {
    return {} as T
  }

  return (await response.json()) as T
}

export const loadSessionWithRefresh = async (
  fetchSession: () => Promise<Response>,
  refreshSession: () => Promise<Response>
): Promise<ISessionResponse | null> => {
  let response = await fetchSession()

  if (response.status === 401) {
    const refreshResponse = await refreshSession()
    if (refreshResponse.ok) {
      response = await fetchSession()
    }
  }

  if (!response.ok) {
    return null
  }

  return readJsonResponse<ISessionResponse>(response)
}

export const loadSession = async (
  fetchImpl: TAuthFetch = fetch
): Promise<ISessionResponse | null> =>
  loadSessionWithRefresh(
    () =>
      fetchAuthRoute(
        AUTH_API_PATHS.SESSION,
        {
          method: 'GET',
          cache: 'no-store',
        },
        fetchImpl
      ),
    () =>
      fetchAuthRoute(
        AUTH_API_PATHS.REFRESH,
        {
          method: 'POST',
        },
        fetchImpl
      )
  )
