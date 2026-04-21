const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8080'

/**
 * Get headers for authenticated backend requests (with JWT)
 */
export const getSecureHeaders = (includeContentType = true): HeadersInit => {
  const headers: HeadersInit = {}

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
 * Internal authenticated fetch.
 * Authorization can be passed in options.headers by the caller.
 */
const fetchWithAuth = async (
  path: string,
  options?: RequestInit
): Promise<Response> =>
  fetch(getBackendUrl(path), {
    ...options,
    headers: {
      ...getSecureHeaders(),
      ...options?.headers,
    },
  })

/**
 * Backend fetch wrapper for authenticated backend endpoints.
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
