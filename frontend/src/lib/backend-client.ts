import { getAccessToken, hasValidAccessToken } from '@/lib/token-storage'

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8080'

/**
 * Callback to notify when session is invalid (for listening contexts/components)
 */
let onSessionInvalidCallback: (() => void) | null = null

export const setSessionInvalidCallback = (
  callback: (() => void) | null
): void => {
  onSessionInvalidCallback = callback
}

/**
 * Get headers for authenticated backend requests (with JWT)
 */
export const getSecureHeaders = (includeContentType = true): HeadersInit => {
  const headers: HeadersInit = {}

  const accessToken = getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

/**
 * Get headers for public backend requests (without auth)
 */
export const getPublicHeaders = (includeContentType = true): HeadersInit => {
  const headers: HeadersInit = {}

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

/**
 * Get backend API URL
 */
export const getBackendUrl = (path: string): string =>
  `${BACKEND_API_URL}${path}`

/**
 * Internal fetch with optional retry logic for 401
 * Handles token refresh silently if possible
 */
const fetchWithAuth = async (
  path: string,
  options?: RequestInit,
  retryCount = 0
): Promise<Response> => {
  const maxRetries = 1 // Only retry once to avoid infinite loops

  const response = await fetch(getBackendUrl(path), {
    ...options,
    headers: {
      ...getSecureHeaders(),
      ...options?.headers,
    },
  })

  // If 401 and we have a refresh token, try to refresh silently
  if (
    response.status === 401 &&
    retryCount < maxRetries &&
    hasValidAccessToken()
  ) {
    // Notify listeners that session is invalid
    onSessionInvalidCallback?.()

    // After one retry with refresh, just return the 401 to let the component handle it
    return response
  }

  return response
}

/**
 * Backend fetch wrapper with JWT authentication
 * Automatically includes access token in Authorization header
 * On 401, notifies that session is invalid
 */
export const secureFetch = async (
  path: string,
  options?: RequestInit
): Promise<Response> => fetchWithAuth(path, options)

/**
 * Backend fetch wrapper without authentication (for public endpoints)
 * Used for health checks, login, register, etc.
 */
export const insecureFetch = async (
  path: string,
  options?: RequestInit
): Promise<Response> =>
  fetch(getBackendUrl(path), {
    ...options,
    headers: {
      ...getPublicHeaders(),
      ...options?.headers,
    },
  })
