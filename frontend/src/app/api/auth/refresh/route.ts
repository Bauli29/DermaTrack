import { NextResponse } from 'next/server'

import {
  proxyAuthRequest,
  readJsonBody,
  RefreshRequestSchema,
  validationErrorResponse,
} from '../_utils'

export const POST = async (request: Request): Promise<NextResponse> => {
  const body = await readJsonBody<unknown>(request)
  const parsed = RefreshRequestSchema.safeParse(body)

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.issues)
  }

  return proxyAuthRequest('/refresh', {
    method: 'POST',
    body: JSON.stringify(parsed.data),
  })
}
