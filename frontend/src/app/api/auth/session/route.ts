import { NextRequest, NextResponse } from 'next/server'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

import {
  createAuthenticatedSessionResponse,
  extractUsernameFromAccessToken,
  isAccessTokenExpired,
  unauthenticatedSessionResponse,
} from '../_utils'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value

  if (!accessToken || isAccessTokenExpired(accessToken)) {
    return unauthenticatedSessionResponse()
  }

  const username = extractUsernameFromAccessToken(accessToken)

  if (!username) {
    return unauthenticatedSessionResponse()
  }

  return NextResponse.json(createAuthenticatedSessionResponse(username), {
    status: 200,
  })
}
