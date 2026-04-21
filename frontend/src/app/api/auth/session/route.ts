import { NextRequest, NextResponse } from 'next/server'

import {
  AUTH_COOKIE_NAMES,
  clearAuthCookies,
  extractUsernameFromAccessToken,
  isAccessTokenExpired,
} from '../_utils'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value

  if (!accessToken || isAccessTokenExpired(accessToken)) {
    const response = NextResponse.json(
      { isLoggedIn: false, user: null },
      { status: 401 }
    )
    clearAuthCookies(response)
    return response
  }

  const username = extractUsernameFromAccessToken(accessToken)

  if (!username) {
    const response = NextResponse.json(
      { isLoggedIn: false, user: null },
      { status: 401 }
    )
    clearAuthCookies(response)
    return response
  }

  return NextResponse.json(
    {
      isLoggedIn: true,
      user: {
        id: '',
        username,
        email: '',
        createdAt: '',
      },
    },
    { status: 200 }
  )
}
