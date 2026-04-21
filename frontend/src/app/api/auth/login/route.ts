import { NextResponse } from 'next/server'

import { EAuthErrorCode } from '@/types/errors'

import {
  callBackendAuth,
  extractUsernameFromAccessToken,
  forwardBackendResponse,
  LoginRequestSchema,
  readJsonBody,
  setAuthCookies,
  validationErrorResponse,
} from '../_utils'

import type { IAuthResponse } from '@/types/auth'
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
    return forwardBackendResponse(backendResponse)
  }

  const tokenResponse = (await backendResponse
    .json()
    .catch(() => null)) as IAuthResponse | null

  if (!tokenResponse?.accessToken || !tokenResponse.refreshToken) {
    const responseBody = {
      error: 'Invalid auth response from backend',
      code: EAuthErrorCode.UNKNOWN_ERROR,
      statusCode: 502,
    }

    return NextResponse.json(responseBody, { status: 502 })
  }

  const username = extractUsernameFromAccessToken(tokenResponse.accessToken)
  const response = NextResponse.json({
    user: username
      ? {
          id: '',
          username,
          email: '',
          createdAt: '',
        }
      : null,
  })

  setAuthCookies(
    response,
    tokenResponse.accessToken,
    tokenResponse.refreshToken
  )
  return response
}
