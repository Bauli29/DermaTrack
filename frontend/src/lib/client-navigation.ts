'use client'

const SAFE_REDIRECT_ORIGIN = 'https://dermatrack.local'

export const getSafeInternalPath = (
  value: string | null | undefined,
  fallbackPath = '/'
): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallbackPath
  }

  try {
    const url = new URL(value, SAFE_REDIRECT_ORIGIN)

    if (url.origin !== SAFE_REDIRECT_ORIGIN) {
      return fallbackPath
    }

    return `${url.pathname}${url.search}${url.hash}` || fallbackPath
  } catch {
    return fallbackPath
  }
}

export const getSafeRedirectPathFromSearch = (
  search: string,
  parameterName = 'next',
  fallbackPath = '/'
): string =>
  getSafeInternalPath(
    new URLSearchParams(search).get(parameterName),
    fallbackPath
  )

export const replaceBrowserLocation = (path: string): void => {
  window.location.replace(path)
}
