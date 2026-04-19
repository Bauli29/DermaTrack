import {
  EAuthErrorCode,
  formatErrorMessage,
  isAuthError,
  isSessionError,
  isValidationError,
  parseApiError,
  statusCodeToErrorCode,
} from '../errors'

describe('auth error helpers', () => {
  it('maps HTTP status codes to auth error codes', () => {
    expect(statusCodeToErrorCode(401)).toBe(EAuthErrorCode.SESSION_EXPIRED)
    expect(statusCodeToErrorCode(409)).toBe(EAuthErrorCode.USERNAME_TAKEN)
    expect(statusCodeToErrorCode(500)).toBe(EAuthErrorCode.SERVER_ERROR)
    expect(statusCodeToErrorCode(418)).toBe(EAuthErrorCode.UNKNOWN_ERROR)
  })

  it('parses duplicate email errors from backend', () => {
    const parsed = parseApiError({ error: 'Email already exists' }, 409)

    expect(parsed.code).toBe(EAuthErrorCode.EMAIL_TAKEN)
    expect(parsed.message).toBe('Email already registered')
  })

  it('parses invalid credentials errors from backend', () => {
    const parsed = parseApiError({ error: 'Invalid credentials' }, 401)

    expect(parsed.code).toBe(EAuthErrorCode.INVALID_CREDENTIALS)
    expect(parsed.message).toBe('Incorrect email or password')
  })

  it('formats known error messages for UI', () => {
    const message = formatErrorMessage({
      code: EAuthErrorCode.SESSION_EXPIRED,
      message: 'x',
    })

    expect(message).toContain('session has expired')
  })

  it('recognizes auth and session errors with type guards', () => {
    const sessionError = {
      code: EAuthErrorCode.SESSION_EXPIRED,
      message: 'expired',
    }

    expect(isAuthError(sessionError)).toBe(true)
    expect(isSessionError(sessionError)).toBe(true)
    expect(isValidationError(sessionError)).toBe(false)
  })
})
