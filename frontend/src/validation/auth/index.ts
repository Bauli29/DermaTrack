import type { TValidationState } from '@/components/molecules/Input/types'
import { z } from 'zod'

export const EmailSchema = z
  .email('Invalid email format')
  .min(5, 'Email is required')

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores and hyphens'
  )

export const PasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character')

export const PasswordConfirmSchema = z
  .object({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    password: PasswordSchema,
  })
  .refine(data => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type TEmailInput = z.infer<typeof EmailSchema>
export type TUsernameInput = z.infer<typeof UsernameSchema>
export type TPasswordInput = z.infer<typeof PasswordSchema>
export type TPasswordConfirmInput = z.infer<typeof PasswordConfirmSchema>

export const validateUsername = (value: string): TValidationState => {
  if (value.length === 0) return 'none'
  const result = UsernameSchema.safeParse(value)
  return result.success ? 'success' : 'error'
}

export const validateEmail = (value: string): TValidationState => {
  if (value.length === 0) return 'none'
  const result = EmailSchema.safeParse(value)
  return result.success ? 'success' : 'error'
}

export const validatePassword = (value: string): TValidationState => {
  if (value.length === 0) return 'none'
  const result = PasswordSchema.safeParse(value)
  return result.success ? 'success' : 'error'
}

export const validateConfirmPassword = (
  confirmPassword: string,
  password: string
): TValidationState => {
  if (confirmPassword.length === 0) return 'none'
  const result = PasswordConfirmSchema.safeParse({
    confirmPassword,
    password,
  })
  return result.success ? 'success' : 'error'
}
