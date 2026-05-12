import { NextResponse } from 'next/server'
import { z } from 'zod'

import { insecureFetch } from '@/lib/backend-client'

import { createAuthError, EAuthErrorCode } from '@/types/errors'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

import type { IAuthApiErrorResponse } from './backend-error-utils'
import { normalizeBackendError, readAuthTokens } from './backend-error-utils'
import {
  LoginRequestSchema,
  RefreshRequestSchema,
  RegisterRequestSchema,
  UsernameSchema,
} from './schema-utils'
import {
  createAuthenticatedSessionResponse,
  createUnauthenticatedSessionResponse,
} from './session-utils'
import {
  extractUsernameFromAccessToken,
  getTokenMaxAge,
  isAccessTokenExpired,
} from './token-utils'

const BACKEND_AUTH_BASE_PATH = '/api/auth'

export type { IAuthApiErrorResponse }
export {
  createAuthenticatedSessionResponse,
  createUnauthenticatedSessionResponse,
  extractUsernameFromAccessToken,
  isAccessTokenExpired,
  LoginRequestSchema,
  readAuthTokens,
  RefreshRequestSchema,
  RegisterRequestSchema,
  UsernameSchema,
}

export const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void => {
  const secure = process.env.NODE_ENV === 'production'

  response.cookies.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: getTokenMaxAge(accessToken, 15 * 60),
  })

  response.cookies.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: getTokenMaxAge(refreshToken, 7 * 24 * 60 * 60),
  })

  response.cookies.set(AUTH_COOKIE_NAMES.AUTH_STATE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: getTokenMaxAge(refreshToken, 7 * 24 * 60 * 60),
  })
}

export const clearAuthCookies = (response: NextResponse): void => {
  const secure = process.env.NODE_ENV === 'production'
  const clearCookie = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: 0,
  }

  response.cookies.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, '', clearCookie)
  response.cookies.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, '', clearCookie)
  response.cookies.set(AUTH_COOKIE_NAMES.AUTH_STATE, '0', clearCookie)
}

export const invalidBackendAuthResponse = (
  clearCookies = false
): NextResponse => {
  const response = NextResponse.json(
    {
      error: 'Invalid auth response from backend',
      code: EAuthErrorCode.UNKNOWN_ERROR,
      statusCode: 502,
    },
    { status: 502 }
  )

  if (clearCookies) {
    clearAuthCookies(response)
  }

  return response
}

export const unauthenticatedSessionResponse = (): NextResponse =>
  NextResponse.json(createUnauthenticatedSessionResponse(), {
    status: 401,
  })

export const readJsonBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export const validationErrorResponse = (issues: z.ZodIssue[]): NextResponse =>
  NextResponse.json(
    {
      error: 'Validation failed',
      code: EAuthErrorCode.VALIDATION_ERROR,
      statusCode: 400,
      details: issues.map(issue => {
        const field = issue.path.length > 0 ? issue.path.join('.') : 'root'
        return `${field}: ${issue.message}`
      }),
    },
    { status: 400 }
  )

export const forwardBackendResponse = async (
  response: Response
): Promise<NextResponse> => {
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  if (!response.ok) {
    const errorResponse = await normalizeBackendError(response)
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    })
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null)
    return NextResponse.json(body ?? {}, { status: response.status })
  }

  const text = await response.text().catch(() => '')
  return NextResponse.json(text ? { message: text } : {}, {
    status: response.status,
  })
}

export const callBackendAuth = async (
  path: string,
  options?: RequestInit
): Promise<Response> =>
  insecureFetch(`${BACKEND_AUTH_BASE_PATH}${path}`, options)

export const proxyAuthRequest = async (
  path: string,
  options?: RequestInit
): Promise<NextResponse> => {
  try {
    const backendResponse = await callBackendAuth(path, options)
    return forwardBackendResponse(backendResponse)
  } catch {
    const error = createAuthError(
      EAuthErrorCode.NETWORK_ERROR,
      'Unable to reach authentication service',
      503
    )

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
      { status: error.statusCode ?? 503 }
    )
  }
}
