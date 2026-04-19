/**
 * Error types and helpers for consistent error handling
 */

/**
 * Auth-specific error codes
 */
export enum EAuthErrorCode {
  // Backend/API errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_FAILED = 'REFRESH_FAILED',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_USERNAME = 'INVALID_USERNAME',

  // Network/client errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',

  // Generic fallback
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Auth error with structured information
 */
export interface IAuthError {
  code: EAuthErrorCode
  message: string
  statusCode?: number
  details?: { [key: string]: unknown }
}

/**
 * Validation error per field
 */
export interface IValidationErrorDetail {
  field: string
  message: string
}

/**
 * API error response structure (matches potential backend format)
 */
export interface IApiErrorResponse {
  error: string
  details?: string[] | IValidationErrorDetail[]
  message?: string
  statusCode?: number
}

/**
 * Type guard: check if error is an IAuthError
 */
export const isAuthError = (error: unknown): error is IAuthError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  'message' in error &&
  Object.values(EAuthErrorCode).includes((error as IAuthError).code)

/**
 * Type guard: check if error is a validation error
 */
export const isValidationError = (error: unknown): error is IAuthError =>
  isAuthError(error) &&
  (error.code === EAuthErrorCode.VALIDATION_ERROR ||
    error.code === EAuthErrorCode.WEAK_PASSWORD ||
    error.code === EAuthErrorCode.INVALID_EMAIL ||
    error.code === EAuthErrorCode.INVALID_USERNAME)

/**
 * Type guard: check if error is a retriable error (shouldn't give up)
 */
export const isRetriableError = (error: unknown): boolean => {
  if (!isAuthError(error)) return false
  const retriableCodes = [
    EAuthErrorCode.NETWORK_ERROR,
    EAuthErrorCode.TIMEOUT,
    EAuthErrorCode.SERVER_ERROR,
    EAuthErrorCode.REFRESH_FAILED,
  ]
  return retriableCodes.includes(error.code)
}

/**
 * Type guard: check if error is a session/auth error
 */
export const isSessionError = (error: unknown): boolean => {
  if (!isAuthError(error)) return false
  const sessionCodes = [
    EAuthErrorCode.SESSION_EXPIRED,
    EAuthErrorCode.TOKEN_INVALID,
    EAuthErrorCode.REFRESH_FAILED,
  ]
  return sessionCodes.includes(error.code)
}

/**
 * Convert HTTP status code to auth error code
 */
export const statusCodeToErrorCode = (statusCode: number): EAuthErrorCode => {
  const errorMap: { [key: number]: EAuthErrorCode } = {
    401: EAuthErrorCode.SESSION_EXPIRED,
    403: EAuthErrorCode.TOKEN_INVALID,
    409: EAuthErrorCode.USERNAME_TAKEN,
    422: EAuthErrorCode.VALIDATION_ERROR,
    500: EAuthErrorCode.SERVER_ERROR,
    503: EAuthErrorCode.SERVER_ERROR,
    0: EAuthErrorCode.NETWORK_ERROR,
  }

  return errorMap[statusCode] ?? EAuthErrorCode.UNKNOWN_ERROR
}

/**
 * Parse API error response and convert to IAuthError
 */
export const parseApiError = (
  response: IApiErrorResponse,
  statusCode: number
): IAuthError => {
  let code = statusCodeToErrorCode(statusCode)
  let message = response.error ?? response.message ?? 'An error occurred'

  // Detect specific errors from response
  if (response.error?.includes('already exists')) {
    if (response.error?.includes('Email')) {
      code = EAuthErrorCode.EMAIL_TAKEN
      message = 'Email already registered'
    } else if (response.error?.includes('Username')) {
      code = EAuthErrorCode.USERNAME_TAKEN
      message = 'Username already taken'
    }
  }

  if (response.error?.includes('Invalid credentials')) {
    code = EAuthErrorCode.INVALID_CREDENTIALS
    message = 'Incorrect email or password'
  }

  if (response.error?.includes('Validation failed')) {
    code = EAuthErrorCode.VALIDATION_ERROR
  }

  return {
    code,
    message,
    statusCode,
    details: response.details ? { details: response.details } : undefined,
  }
}

/**
 * Format error for display to user
 * Returns user-friendly error message
 */
export const formatErrorMessage = (error: IAuthError): string => {
  const messageMap: { [key in EAuthErrorCode]: string } = {
    [EAuthErrorCode.INVALID_CREDENTIALS]: 'Email or password is incorrect',
    [EAuthErrorCode.USER_NOT_FOUND]: 'User not found',
    [EAuthErrorCode.USERNAME_TAKEN]: 'Username is already taken',
    [EAuthErrorCode.EMAIL_TAKEN]: 'Email is already registered',
    [EAuthErrorCode.SESSION_EXPIRED]:
      'Your session has expired. Please log in again.',
    [EAuthErrorCode.TOKEN_INVALID]:
      'Your session is invalid. Please log in again.',
    [EAuthErrorCode.REFRESH_FAILED]:
      'Could not refresh session. Please log in again.',
    [EAuthErrorCode.VALIDATION_ERROR]: 'Please check your input and try again',
    [EAuthErrorCode.WEAK_PASSWORD]:
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    [EAuthErrorCode.INVALID_EMAIL]: 'Please enter a valid email address',
    [EAuthErrorCode.INVALID_USERNAME]:
      'Username can only contain letters, numbers, underscores, and hyphens',
    [EAuthErrorCode.NETWORK_ERROR]:
      'Network error. Please check your connection.',
    [EAuthErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
    [EAuthErrorCode.SERVER_ERROR]: 'Server error. Please try again later.',
    [EAuthErrorCode.UNKNOWN_ERROR]:
      error.message || 'An unexpected error occurred',
  }

  return messageMap[error.code] ?? error.message ?? 'An error occurred'
}

/**
 * Create a generic auth error
 */
export const createAuthError = (
  code: EAuthErrorCode,
  message: string,
  statusCode?: number,
  details?: { [key: string]: unknown }
): IAuthError => ({
  code,
  message,
  statusCode,
  details,
})
