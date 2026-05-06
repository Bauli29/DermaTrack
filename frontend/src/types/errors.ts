/**
 * Error types and helpers for consistent error handling
 */

/**
 * Auth-specific error codes
 */
export enum EAuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_FAILED = 'REFRESH_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_USERNAME = 'INVALID_USERNAME',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

const VALIDATION_ERROR_CODES = new Set<EAuthErrorCode>([
  EAuthErrorCode.VALIDATION_ERROR,
  EAuthErrorCode.WEAK_PASSWORD,
  EAuthErrorCode.INVALID_EMAIL,
  EAuthErrorCode.INVALID_USERNAME,
])

const RETRIABLE_ERROR_CODES = new Set<EAuthErrorCode>([
  EAuthErrorCode.NETWORK_ERROR,
  EAuthErrorCode.TIMEOUT,
  EAuthErrorCode.SERVER_ERROR,
  EAuthErrorCode.REFRESH_FAILED,
])

const SESSION_ERROR_CODES = new Set<EAuthErrorCode>([
  EAuthErrorCode.SESSION_EXPIRED,
  EAuthErrorCode.TOKEN_INVALID,
  EAuthErrorCode.REFRESH_FAILED,
])

const STATUS_CODE_ERROR_MAP: Readonly<{
  [statusCode: number]: EAuthErrorCode
}> = {
  0: EAuthErrorCode.NETWORK_ERROR,
  401: EAuthErrorCode.SESSION_EXPIRED,
  403: EAuthErrorCode.TOKEN_INVALID,
  409: EAuthErrorCode.USERNAME_TAKEN,
  422: EAuthErrorCode.VALIDATION_ERROR,
  500: EAuthErrorCode.SERVER_ERROR,
  503: EAuthErrorCode.SERVER_ERROR,
}

const USER_FACING_ERROR_MESSAGES: Readonly<{
  [key in EAuthErrorCode]: string
}> = {
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
    'Password must be at least 12 characters with uppercase, lowercase, number, and special character',
  [EAuthErrorCode.INVALID_EMAIL]: 'Please enter a valid email address',
  [EAuthErrorCode.INVALID_USERNAME]:
    'Username can only contain letters, numbers, underscores, and hyphens',
  [EAuthErrorCode.NETWORK_ERROR]:
    'Network error. Please check your connection.',
  [EAuthErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
  [EAuthErrorCode.SERVER_ERROR]: 'Server error. Please try again later.',
  [EAuthErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred',
}

interface ISpecificApiErrorMatch {
  code: EAuthErrorCode
  message?: string
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

const getApiErrorText = (response: IApiErrorResponse): string => {
  if (typeof response.error === 'string' && response.error.trim().length > 0) {
    return response.error
  }

  if (
    typeof response.message === 'string' &&
    response.message.trim().length > 0
  ) {
    return response.message
  }

  return 'An error occurred'
}

const includesText = (source: string | undefined, fragment: string): boolean =>
  source?.includes(fragment) ?? false

const getDuplicateEntityError = (
  errorText: string
): ISpecificApiErrorMatch | null => {
  if (!includesText(errorText, 'already exists')) {
    return null
  }

  if (includesText(errorText, 'Email')) {
    return {
      code: EAuthErrorCode.EMAIL_TAKEN,
      message: 'Email already registered',
    }
  }

  if (includesText(errorText, 'Username')) {
    return {
      code: EAuthErrorCode.USERNAME_TAKEN,
      message: 'Username already taken',
    }
  }

  return null
}

const getSpecificApiError = (
  errorText: string
): ISpecificApiErrorMatch | null =>
  getDuplicateEntityError(errorText) ??
  (includesText(errorText, 'Invalid credentials')
    ? {
        code: EAuthErrorCode.INVALID_CREDENTIALS,
        message: 'Incorrect email or password',
      }
    : null) ??
  (includesText(errorText, 'Validation failed')
    ? { code: EAuthErrorCode.VALIDATION_ERROR }
    : null)

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
  isAuthError(error) && VALIDATION_ERROR_CODES.has(error.code)

/**
 * Type guard: check if error is a retriable error (shouldn't give up)
 */
export const isRetriableError = (error: unknown): boolean =>
  isAuthError(error) && RETRIABLE_ERROR_CODES.has(error.code)

/**
 * Type guard: check if error is a session/auth error
 */
export const isSessionError = (error: unknown): boolean =>
  isAuthError(error) && SESSION_ERROR_CODES.has(error.code)

/**
 * Convert HTTP status code to auth error code
 */
export const statusCodeToErrorCode = (statusCode: number): EAuthErrorCode =>
  STATUS_CODE_ERROR_MAP[statusCode] ?? EAuthErrorCode.UNKNOWN_ERROR

/**
 * Parse API error response and convert to IAuthError
 */
export const parseApiError = (
  response: IApiErrorResponse,
  statusCode: number
): IAuthError => {
  const errorText = getApiErrorText(response)
  const specificError = getSpecificApiError(errorText)

  return {
    code: specificError?.code ?? statusCodeToErrorCode(statusCode),
    message: specificError?.message ?? errorText,
    statusCode,
    details: response.details ? { details: response.details } : undefined,
  }
}

/**
 * Format error for display to user
 * Returns user-friendly error message
 */
export const formatErrorMessage = (error: IAuthError): string =>
  error.code === EAuthErrorCode.UNKNOWN_ERROR
    ? error.message || USER_FACING_ERROR_MESSAGES[EAuthErrorCode.UNKNOWN_ERROR]
    : (USER_FACING_ERROR_MESSAGES[error.code] ??
      error.message ??
      'An error occurred')

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
