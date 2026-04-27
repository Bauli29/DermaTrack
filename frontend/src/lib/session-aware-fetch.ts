'use client'

type TFetch = (input: string, init?: RequestInit) => Promise<Response>

interface ISessionAwareFetchOptions {
  fetchImpl?: TFetch
  enableSessionRecovery?: boolean
}

const cloneRequestInit = (init?: RequestInit): RequestInit | undefined => {
  if (!init) {
    return undefined
  }

  return {
    ...init,
    headers: init.headers,
    body: init.body,
  }
}

let pendingRefresh: Promise<boolean> | null = null

const refreshSessionSilently = async (fetchImpl: TFetch): Promise<boolean> => {
  const response = await fetchImpl('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })

  return response.ok
}

const attemptRefreshOnce = async (fetchImpl: TFetch): Promise<boolean> => {
  pendingRefresh ??= refreshSessionSilently(fetchImpl).finally(() => {
    pendingRefresh = null
  })

  return pendingRefresh
}

/**
 * Fetch wrapper that automatically attempts a silent refresh on 401.
 * - First 401: Attempts a silent token refresh in the background
 * - If refresh succeeds: Retries the original request once
 * - If refresh fails (second 401): Returns the 401 response (caller handles session-expired)
 * - Subsequent retries: No further attempts, returns response as-is
 */
export const sessionAwareFetch = async (
  input: string,
  init?: RequestInit,
  {
    fetchImpl = fetch,
    enableSessionRecovery = true,
  }: ISessionAwareFetchOptions = {},
  retryCount = 0
): Promise<Response> => {
  const requestInit = cloneRequestInit(init)
  const response = await fetchImpl(input, requestInit)

  if (!enableSessionRecovery || response.status !== 401 || retryCount >= 1) {
    return response
  }

  const refreshSucceeded = await attemptRefreshOnce(fetchImpl)

  if (!refreshSucceeded) {
    return response
  }

  return sessionAwareFetch(
    input,
    requestInit,
    {
      fetchImpl,
      enableSessionRecovery,
    },
    retryCount + 1
  )
}
