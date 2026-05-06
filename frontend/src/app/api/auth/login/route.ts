import { NextResponse } from 'next/server'

import { EAuthErrorCode } from '@/types/errors'

import {
  callBackendAuth,
  createAuthenticatedSessionResponse,
  extractUsernameFromAccessToken,
  forwardBackendResponse,
  invalidBackendAuthResponse,
  LoginRequestSchema,
  readAuthTokens,
  readJsonBody,
  setAuthCookies,
  validationErrorResponse,
} from '../_utils'

export const POST = async (request: Request): Promise<NextResponse> => {
  const body = await readJsonBody<unknown>(request)
  const parsed = LoginRequestSchema.safeParse(body)

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.issues)
  }

  const backendResponse = await callBackendAuth('/login', {
    method: 'POST',
    body: JSON.stringify(parsed.data),
  })

  if (!backendResponse.ok) {
    if (backendResponse.status === 401) {
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          code: EAuthErrorCode.INVALID_CREDENTIALS,
          statusCode: 401,
        },
        { status: 401 }
      )
    }
    return forwardBackendResponse(backendResponse)
  }

  const tokenResponse = await readAuthTokens(backendResponse)

  if (!tokenResponse?.accessToken || !tokenResponse.refreshToken) {
    return invalidBackendAuthResponse()
  }

  const username = extractUsernameFromAccessToken(tokenResponse.accessToken)
  const response = NextResponse.json({
    user: username ? createAuthenticatedSessionResponse(username).user : null,
  })

  setAuthCookies(
    response,
    tokenResponse.accessToken,
    tokenResponse.refreshToken
  )
  return response
}
