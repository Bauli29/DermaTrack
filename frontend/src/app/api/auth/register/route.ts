import { NextResponse } from 'next/server'

import {
  proxyAuthRequest,
  readJsonBody,
  RegisterRequestSchema,
  validationErrorResponse,
} from '../_utils'

export const POST = async (request: Request): Promise<NextResponse> => {
  const body = await readJsonBody<unknown>(request)
  const parsed = RegisterRequestSchema.safeParse(body)

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.issues)
  }

  return proxyAuthRequest('/register', {
    method: 'POST',
    body: JSON.stringify(parsed.data),
  })
}
