const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8080'
const AUTH_USERNAME = process.env.AUTH_USERNAME ?? '_'
const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? '_'

const basicAuth = Buffer.from(`${AUTH_USERNAME}:${AUTH_PASSWORD}`).toString(
  'base64'
)

/**
 * Get headers for backend requests including authentication
 */
export const getBackendHeaders = (includeContentType = true): HeadersInit => {
  const headers: HeadersInit = {
    Authorization: `Basic ${basicAuth}`,
  }

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
 * Backend fetch wrapper with auth included
 */
export const secureFetch = async (
  path: string,
  options?: RequestInit
): Promise<Response> =>
  fetch(getBackendUrl(path), {
    ...options,
    headers: {
      ...getBackendHeaders(),
      ...options?.headers,
    },
  })

export const insecureFetch = async (
  path: string,
  options?: RequestInit
): Promise<Response> =>
  fetch(getBackendUrl(path), {
    ...options,
    headers: {
      ...options?.headers,
    },
  })
