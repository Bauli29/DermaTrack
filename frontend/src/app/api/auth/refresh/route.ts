import { NextRequest, NextResponse } from 'next/server'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

import { EAuthErrorCode } from '@/types/errors'

import {
  callBackendAuth,
  clearAuthCookies,
  forwardBackendResponse,
  invalidBackendAuthResponse,
  readAuthTokens,
  setAuthCookies,
} from '../_utils'

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const refreshToken = request.cookies
    .get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)
    ?.value?.trim()

  if (!refreshToken) {
    const response = NextResponse.json(
      {
        error: 'Refresh token is required',
        code: EAuthErrorCode.TOKEN_INVALID,
        statusCode: 401,
      },
      { status: 401 }
    )
    clearAuthCookies(response)
    return response
  }

  const backendResponse = await callBackendAuth('/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })

  if (!backendResponse.ok) {
    const response = await forwardBackendResponse(backendResponse)
    if (backendResponse.status === 401) {
      clearAuthCookies(response)
    }
    return response
  }

  const tokenResponse = await readAuthTokens(backendResponse)

  if (!tokenResponse?.accessToken || !tokenResponse.refreshToken) {
    return invalidBackendAuthResponse(true)
  }

  const response = NextResponse.json({ refreshed: true }, { status: 200 })
  setAuthCookies(
    response,
    tokenResponse.accessToken,
    tokenResponse.refreshToken
  )
  return response
}
