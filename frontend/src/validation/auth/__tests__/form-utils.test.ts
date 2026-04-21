import {
  CONFIRM_PASSWORD_HELPER_TEXT,
  EMAIL_HELPER_TEXT,
  getValidationHelperText,
  PASSWORD_HELPER_TEXT,
  USERNAME_HELPER_TEXT,
  validateLoginForm,
  validateRegistrationForm,
} from '../form-utils'

describe('auth form utils', () => {
  it('returns helper text only for invalid validation states', () => {
    expect(getValidationHelperText('error', USERNAME_HELPER_TEXT)).toBe(
      USERNAME_HELPER_TEXT
    )
    expect(getValidationHelperText('success', USERNAME_HELPER_TEXT)).toBe('')
    expect(getValidationHelperText('none', USERNAME_HELPER_TEXT)).toBe('')
  })

  it('validates login forms through one shared snapshot', () => {
    expect(validateLoginForm('valid_user', 'ValidPass123!')).toEqual({
      username: 'success',
      password: 'success',
      isValid: true,
    })

    expect(validateLoginForm('x', 'short')).toEqual({
      username: 'error',
      password: 'error',
      isValid: false,
    })
  })

  it('validates registration forms through one shared snapshot', () => {
    expect(
      validateRegistrationForm({
        username: 'valid_user',
        email: 'user@example.com',
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
        acceptTerms: true,
      })
    ).toEqual({
      username: 'success',
      email: 'success',
      password: 'success',
      confirmPassword: 'success',
      isValid: true,
    })

    expect(
      validateRegistrationForm({
        username: 'x',
        email: 'bad-email',
        password: 'short',
        confirmPassword: 'different',
        acceptTerms: false,
      })
    ).toEqual({
      username: 'error',
      email: 'error',
      password: 'error',
      confirmPassword: 'error',
      isValid: false,
    })
  })

  it('exports stable shared helper texts for auth templates', () => {
    expect(USERNAME_HELPER_TEXT).toContain('3-50 chars')
    expect(EMAIL_HELPER_TEXT).toBe('Invalid email')
    expect(PASSWORD_HELPER_TEXT).toContain('Min. 12 characters')
    expect(CONFIRM_PASSWORD_HELPER_TEXT).toBe('Passwords do not match')
  })
})
