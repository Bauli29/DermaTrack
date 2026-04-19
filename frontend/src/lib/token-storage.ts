import type { ITokenPayload } from '@/types/auth'

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'dermatrack_access_token',
  REFRESH_TOKEN: 'dermatrack_refresh_token',
}

const AUTH_STATE_COOKIE = 'dermatrack_auth'

const setAuthStateCookie = (isLoggedIn: boolean): void => {
  if (typeof document === 'undefined') {
    return
  }

  const maxAge = isLoggedIn ? 60 * 60 * 24 * 7 : 0
  document.cookie = `${AUTH_STATE_COOKIE}=${isLoggedIn ? '1' : '0'}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

/**
 * Decode JWT payload without verification (safe for client-side expiry check)
 * Note: This does NOT verify the signature; signature is verified by backend on use
 */
export const decodeToken = (token: string): ITokenPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const decoded = JSON.parse(atob(parts[1]))
    return decoded as ITokenPayload
  } catch {
    return null
  }
}

/**
 * Check if a token is expired based on its exp claim
 * Returns true if token is expired or invalid
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token)
  if (!payload?.exp) return true

  // exp is in seconds, convert to milliseconds
  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()

  // Consider token expired if within 60 seconds of expiry (grace period)
  return currentTime >= expirationTime - 60000
}

/**
 * Get username from token payload
 */
export const getTokenUsername = (token: string): string | null => {
  const payload = decodeToken(token)
  return payload?.sub ?? null
}

/**
 * Set access token in localStorage
 */
export const setAccessToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token)
    setAuthStateCookie(true)
  } catch {
    return
  }
}

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
  } catch {
    return null
  }
}

/**
 * Set refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token)
  } catch {
    return
  }
}

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
  } catch {
    return null
  }
}

/**
 * Store both access and refresh tokens
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  setAccessToken(accessToken)
  setRefreshToken(refreshToken)
  setAuthStateCookie(true)
}

/**
 * Get both tokens as a pair
 */
export const getTokens = (): {
  accessToken: string | null
  refreshToken: string | null
} => ({
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
})

/**
 * Clear both tokens from storage
 */
export const clearTokens = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN)
    setAuthStateCookie(false)
  } catch {
    return
  }
}

/**
 * Check if user has valid (non-expired) access token
 */
export const hasValidAccessToken = (): boolean => {
  const token = getAccessToken()
  return token !== null && !isTokenExpired(token)
}

/**
 * Check if user has valid (non-expired) refresh token
 */
export const hasValidRefreshToken = (): boolean => {
  const token = getRefreshToken()
  return token !== null && !isTokenExpired(token)
}

/**
 * Get time until access token expires (in milliseconds)
 * Returns 0 if token is expired, negative if invalid
 */
export const getAccessTokenExpiresIn = (): number => {
  const token = getAccessToken()
  if (!token) return -1

  const payload = decodeToken(token)
  if (!payload?.exp) return -1

  const expirationTime = payload.exp * 1000
  const timeLeft = expirationTime - Date.now()
  return Math.max(0, timeLeft)
}
