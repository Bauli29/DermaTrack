import {
  clearTokens,
  decodeToken,
  getAccessToken,
  getRefreshToken,
  getTokenUsername,
  hasValidAccessToken,
  isTokenExpired,
  setTokens,
} from '../token-storage'

const createJwt = (payload: { [key: string]: unknown }): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('token-storage', () => {
  beforeEach(() => {
    localStorage.clear()
    document.cookie = 'dermatrack_auth=; Path=/; Max-Age=0; SameSite=Lax'
  })

  it('stores and reads access/refresh tokens', () => {
    setTokens('access-token', 'refresh-token')

    expect(getAccessToken()).toBe('access-token')
    expect(getRefreshToken()).toBe('refresh-token')
  })

  it('sets auth-state cookie when tokens are stored and clears it on clearTokens', () => {
    setTokens('access-token', 'refresh-token')
    expect(document.cookie).toContain('dermatrack_auth=1')

    clearTokens()
    expect(document.cookie).not.toContain('dermatrack_auth=1')
  })

  it('extracts username from token subject', () => {
    const token = createJwt({
      sub: 'alice',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    expect(getTokenUsername(token)).toBe('alice')
  })

  it('returns null for malformed token payload', () => {
    expect(decodeToken('bad.token')).toBeNull()
  })

  it('marks expired token as expired and valid token as not expired', () => {
    const expiredToken = createJwt({
      sub: 'alice',
      exp: Math.floor(Date.now() / 1000) - 60,
    })
    const validToken = createJwt({
      sub: 'alice',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    expect(isTokenExpired(expiredToken)).toBe(true)
    expect(isTokenExpired(validToken)).toBe(false)
  })

  it('hasValidAccessToken is true only for present and non-expired token', () => {
    expect(hasValidAccessToken()).toBe(false)

    const validToken = createJwt({
      sub: 'alice',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    setTokens(validToken, 'refresh-token')

    expect(hasValidAccessToken()).toBe(true)
  })
})
