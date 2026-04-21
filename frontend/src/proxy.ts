import { NextRequest, NextResponse } from 'next/server'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'
import { getAuthRedirectPath } from '@/lib/auth-route-guard'

export const proxy = (request: NextRequest): NextResponse => {
  const { pathname } = request.nextUrl
  const isLoggedIn =
    request.cookies.get(AUTH_COOKIE_NAMES.AUTH_STATE)?.value === '1'
  const redirectPath = getAuthRedirectPath(pathname, isLoggedIn)

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
