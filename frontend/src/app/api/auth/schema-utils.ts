import { z } from 'zod'

import { EmailSchema, PasswordSchema } from '@/validation/auth'

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
