interface ITokenPayload {
  sub?: string
  exp?: number
}

const decodeTokenPayload = (token: string): ITokenPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    return JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    ) as ITokenPayload
  } catch {
    return null
  }
}

export const getTokenMaxAge = (
  token: string,
  fallbackSeconds: number
): number => {
  const payload = decodeTokenPayload(token)
  if (typeof payload?.exp !== 'number') {
    return fallbackSeconds
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  return Math.max(0, payload.exp - nowSeconds)
}

export const extractUsernameFromAccessToken = (
  token: string
): string | null => {
  const payload = decodeTokenPayload(token)
  return typeof payload?.sub === 'string' ? payload.sub : null
}

export const isAccessTokenExpired = (token: string): boolean => {
  const payload = decodeTokenPayload(token)
  if (typeof payload?.exp !== 'number') {
    return true
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSeconds
}
