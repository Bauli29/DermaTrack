import { NextResponse } from 'next/server'
import { z } from 'zod'

import { insecureFetch } from '@/lib/backend-client'

import { createAuthError, EAuthErrorCode, parseApiError } from '@/types/errors'

import { EmailSchema, PasswordSchema } from '@/validation/auth'

const BACKEND_AUTH_BASE_PATH = '/api/auth'

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
