const AUTH_ROUTES = ['/login', '/register']
const PUBLIC_ROUTES = ['/swagger', '/test']

const isAuthRoute = (pathname: string): boolean =>
  AUTH_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  )

const isPublicRoute = (pathname: string): boolean =>
  PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  )

const isProtectedRoute = (pathname: string): boolean => {
  if (isAuthRoute(pathname) || isPublicRoute(pathname)) {
    return false
  }

  return (
    pathname === '/' ||
    pathname.startsWith('/tracking') ||
    pathname.startsWith('/statistics')
  )
}

export const getAuthRedirectPath = (
  pathname: string,
  isLoggedIn: boolean
): string | null => {
  if (isAuthRoute(pathname) && isLoggedIn) {
    return '/'
  }

  if (isProtectedRoute(pathname) && !isLoggedIn) {
    return `/login?next=${encodeURIComponent(pathname)}`
  }

  return null
}
