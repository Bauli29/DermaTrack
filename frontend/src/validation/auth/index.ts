import type { TValidationState } from '@/components/molecules/Input/types'

export const validateEmail = (value: string): TValidationState => {
  if (value.length === 0) return 'none'
  const re = /\S+@\S+\.\S+/
  return re.test(value) ? 'success' : 'error'
}

export const validatePassword = (value: string): TValidationState => {
  if (value.length === 0) return 'none'
  const hasLength = value.length >= 8
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  const hasSpecial = /[^a-zA-Z0-9]/.test(value)

  return hasLength && hasUpper && hasLower && hasNumber && hasSpecial
    ? 'success'
    : 'error'
}

export const validateConfirmPassword = (
  value: string,
  original: string
): TValidationState => {
  if (value.length === 0) return 'none'
  return value === original ? 'success' : 'error'
}
