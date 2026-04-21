import { NextResponse } from 'next/server'
import { z } from 'zod'

import { insecureFetch } from '@/lib/backend-client'

import { createAuthError, EAuthErrorCode, parseApiError } from '@/types/errors'

import { EmailSchema, PasswordSchema } from '@/validation/auth'

const BACKEND_AUTH_BASE_PATH = '/api/auth'

export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'dermatrack_access_token',
  REFRESH_TOKEN: 'dermatrack_refresh_token',
  AUTH_STATE: 'dermatrack_auth',
} as const

export interface IAuthApiErrorResponse {
  error: string
  code: EAuthErrorCode
  statusCode: number
  details?: string[]
}

interface IBackendErrorBody {
  error?: string
  message?: string
  details?: unknown
  statusCode?: number
}

interface ITokenPayload {
  sub?: string
  exp?: number
}

const decodeTokenPayload = (token: string): ITokenPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    ) as ITokenPayload

    return payload
  } catch {
    return null
  }
}

const getTokenMaxAge = (token: string, fallbackSeconds: number): number => {
  const payload = decodeTokenPayload(token)
  if (typeof payload?.exp !== 'number') {
    return fallbackSeconds
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  return Math.max(0, payload.exp - nowSeconds)
}

export const extractUsernameFromAccessToken = (
  token: string
): string | null => {
  const payload = decodeTokenPayload(token)
  return typeof payload?.sub === 'string' ? payload.sub : null
}

export const isAccessTokenExpired = (token: string): boolean => {
  const payload = decodeTokenPayload(token)
  if (typeof payload?.exp !== 'number') {
    return true
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSeconds
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

const getBackendErrorMessage = (
  body: IBackendErrorBody,
  fallbackMessage: string
): string => {
  if (typeof body.error === 'string') {
    return body.error
  }

  if (typeof body.message === 'string') {
    return body.message
  }

  return fallbackMessage
}

const getStringDetails = (details: unknown): string[] | undefined => {
  if (!Array.isArray(details)) {
    return undefined
  }

  const stringDetails = details.filter(
    (detail): detail is string => typeof detail === 'string'
  )

  return stringDetails.length > 0 ? stringDetails : undefined
}

const normalizeBackendError = async (
  response: Response
): Promise<IAuthApiErrorResponse> => {
  const defaultError = createAuthError(
    EAuthErrorCode.UNKNOWN_ERROR,
    'An error occurred',
    response.status
  )

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '')
    const message = text.trim().length > 0 ? text : defaultError.message

    return {
      error: message,
      code: EAuthErrorCode.UNKNOWN_ERROR,
      statusCode: response.status,
    }
  }

  const body = (await response
    .json()
    .catch(() => null)) as IBackendErrorBody | null
  const safeBody = body ?? {}
  const backendError = parseApiError(
    {
      error: getBackendErrorMessage(safeBody, defaultError.message),
      details: getStringDetails(safeBody.details),
      message: getBackendErrorMessage(safeBody, defaultError.message),
      statusCode:
        typeof safeBody.statusCode === 'number'
          ? safeBody.statusCode
          : response.status,
    },
    response.status
  )

  return {
    error: backendError.message,
    code: backendError.code,
    statusCode: backendError.statusCode ?? response.status,
    details: getStringDetails(safeBody.details),
  }
}

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores and hyphens'
  )

export const LoginRequestSchema = z.object({
  username: UsernameSchema,
  password: z.string().min(1, 'Password is required'),
})

export const RegisterRequestSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
})

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
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
