import { createAuthError, EAuthErrorCode, parseApiError } from '@/types/errors'

import type { IAuthResponse } from '@/types/auth'

export interface IAuthApiErrorResponse {
  error: string
  code: EAuthErrorCode
  statusCode: number
  details?: string[]
}

interface IBackendErrorBody {
  error?: string
  errorCode?: string
  message?: string
  details?: unknown
  statusCode?: number
}

const BACKEND_ERROR_CODE_MAP: { readonly [key: string]: EAuthErrorCode } = {
  INVALID_CREDENTIALS: EAuthErrorCode.INVALID_CREDENTIALS,
  INVALID_REFRESH_TOKEN: EAuthErrorCode.SESSION_EXPIRED,
  ACCESS_TOKEN_EXPIRED: EAuthErrorCode.SESSION_EXPIRED,
}

const getBackendErrorMessage = (
  body: IBackendErrorBody,
  fallbackMessage: string
): string => {
  if (typeof body.error === 'string' && body.error.trim().length > 0) {
    return body.error
  }

  if (typeof body.message === 'string' && body.message.trim().length > 0) {
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

export const normalizeBackendError = async (
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
  const errorMessage = getBackendErrorMessage(safeBody, defaultError.message)

  const backendErrorCode =
    typeof safeBody.errorCode === 'string'
      ? BACKEND_ERROR_CODE_MAP[safeBody.errorCode]
      : undefined

  if (backendErrorCode) {
    return {
      error: errorMessage,
      code: backendErrorCode,
      statusCode: response.status,
      details: getStringDetails(safeBody.details),
    }
  }

  const backendError = parseApiError(
    {
      error: errorMessage,
      details: getStringDetails(safeBody.details),
      message: errorMessage,
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

export const readAuthTokens = async (
  response: Response
): Promise<IAuthResponse | null> =>
  (await response.json().catch(() => null)) as IAuthResponse | null
