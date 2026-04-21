import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from './index'

import type { TValidationState } from '@/components/molecules/Input/types'

export interface ILoginValidationResult {
  username: TValidationState
  password: TValidationState
  isValid: boolean
}

export interface IRegistrationValidationResult {
  username: TValidationState
  email: TValidationState
  password: TValidationState
  confirmPassword: TValidationState
  isValid: boolean
}

export const USERNAME_HELPER_TEXT = '3-50 chars; letters, numbers, _ and - only'
export const PASSWORD_HELPER_TEXT =
  'Min. 12 characters, upper/lowercase, number & special character'
export const EMAIL_HELPER_TEXT = 'Invalid email'
export const CONFIRM_PASSWORD_HELPER_TEXT = 'Passwords do not match'

export const getValidationHelperText = (
  validation: TValidationState,
  errorText: string
): string => (validation === 'error' ? errorText : '')

export const validateLoginForm = (
  username: string,
  password: string
): ILoginValidationResult => {
  const usernameValidation = validateUsername(username)
  const passwordValidation = validatePassword(password)

  return {
    username: usernameValidation,
    password: passwordValidation,
    isValid:
      usernameValidation === 'success' && passwordValidation === 'success',
  }
}

export const validateRegistrationForm = ({
  username,
  email,
  password,
  confirmPassword,
  acceptTerms,
}: {
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}): IRegistrationValidationResult => {
  const usernameValidation = validateUsername(username)
  const emailValidation = validateEmail(email)
  const passwordValidation = validatePassword(password)
  const confirmPasswordValidation = validateConfirmPassword(
    confirmPassword,
    password
  )

  return {
    username: usernameValidation,
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation,
    isValid:
      usernameValidation === 'success' &&
      emailValidation === 'success' &&
      passwordValidation === 'success' &&
      confirmPasswordValidation === 'success' &&
      acceptTerms,
  }
}
