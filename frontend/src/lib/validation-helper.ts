import { z } from 'zod'

export interface IValidationSuccess<T> {
  success: true
  data: T
}

export interface IValidationError {
  success: false
  error: {
    error: string
    details: string[]
    issues: readonly z.core.$ZodIssue[] // Zod 4 issue type
  }
}

export type TValidationResult<T> = IValidationSuccess<T> | IValidationError

/**
 * Validates data against a Zod schema with consistent error handling
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns TValidationResult with either success data or formatted error
 */
export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): TValidationResult<T> => {
  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      error: {
        error: 'Validation failed',
        details: result.error.issues.map(issue => {
          const field = issue.path.length > 0 ? issue.path.join('.') : 'root'
          return `${field}: ${issue.message}`
        }),
        issues: result.error.issues,
      },
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

/**
 * Validation helper that throws a formatted error for use with try/catch
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns The validated data
 * @throws ValidationError if validation fails
 */
export const validateRequestOrThrow = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T => {
  const result = validateRequest(schema, data)

  if (!result.success) {
    const error = new Error('Validation failed') as Error & {
      validationError: typeof result.error
    }
    error.validationError = result.error
    throw error
  }

  return result.data
}

/**
 * Helper to check if an error is a validation error
 * @param error - The error to check
 * @returns boolean indicating if it's a validation error
 */
export const isValidationError = (
  error: unknown
): error is Error & { validationError: IValidationError['error'] } =>
  error instanceof Error && 'validationError' in error
