import { NextResponse } from 'next/server'

import {
  LoginRequestSchema,
  proxyAuthRequest,
  readJsonBody,
  validationErrorResponse,
} from '../_utils'

export const POST = async (request: Request): Promise<NextResponse> => {
  const body = await readJsonBody<unknown>(request)
  const parsed = LoginRequestSchema.safeParse(body)

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.issues)
  }

  return proxyAuthRequest('/login', {
    method: 'POST',
    body: JSON.stringify(parsed.data),
  })
}
