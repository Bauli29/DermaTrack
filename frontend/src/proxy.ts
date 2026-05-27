import type { NextRequest } from 'next/server'

import { isAccessTokenExpired } from '@/app/api/auth/token-utils'

import { getAuthRedirectPath } from '@/lib/auth-route-guard'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

export const proxy = (request: NextRequest) => {
  // Lazy-require NextResponse so tests don't load next/server at module import time
  // (which references the global Request implementation not available in Jest).
  const { NextResponse } = require('next/server')

  const { pathname } = request.nextUrl
  const isE2E =
    process.env.NEXT_PUBLIC_E2E === 'true' ||
    request.headers.get('x-playwright-e2e') === 'true'

  if (isE2E) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value
  const refreshToken = request.cookies.get(
    AUTH_COOKIE_NAMES.REFRESH_TOKEN
  )?.value
  const isLoggedIn =
    (typeof accessToken === 'string' && !isAccessTokenExpired(accessToken)) ||
    typeof refreshToken === 'string'
  const redirectPath = getAuthRedirectPath(pathname, isLoggedIn)

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
