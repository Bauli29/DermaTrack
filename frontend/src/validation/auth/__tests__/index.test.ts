import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../index'

describe('Email Validation', () => {
  it('should return "none" for empty string', () => {
    expect(validateEmail('')).toBe('none')
  })

  it('should return "success" for valid email', () => {
    expect(validateEmail('test@example.com')).toBe('success')
  })

  it('should return "error" for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe('error')
  })

  it('should return "error" for email without @', () => {
    expect(validateEmail('testexample.com')).toBe('error')
  })
})

describe('Password Validation', () => {
  it('should return "none" for empty string', () => {
    expect(validatePassword('')).toBe('none')
  })

  it('should return "success" for valid password', () => {
    expect(validatePassword('ValidPass123!')).toBe('success')
  })

  it('should return "error" for password without uppercase', () => {
    expect(validatePassword('validpass123!')).toBe('error')
  })

  it('should return "error" for password without lowercase', () => {
    expect(validatePassword('VALIDPASS123!')).toBe('error')
  })

  it('should return "error" for password without number', () => {
    expect(validatePassword('ValidPass!')).toBe('error')
  })

  it('should return "error" for password without special character', () => {
    expect(validatePassword('ValidPass123')).toBe('error')
  })

  it('should return "error" for password shorter than 8 characters', () => {
    expect(validatePassword('Val1!')).toBe('error')
  })
})

describe('Confirm Password Validation', () => {
  it('should return "none" for empty confirm password', () => {
    expect(validateConfirmPassword('', 'ValidPass123!')).toBe('none')
  })

  it('should return "success" when passwords match', () => {
    expect(validateConfirmPassword('ValidPass123!', 'ValidPass123!')).toBe(
      'success'
    )
  })

  it('should return "error" when passwords do not match', () => {
    expect(validateConfirmPassword('ValidPass123!', 'DifferentPass123!')).toBe(
      'error'
    )
  })
})
