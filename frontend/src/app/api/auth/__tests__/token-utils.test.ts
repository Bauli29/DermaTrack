import {
  extractUsernameFromAccessToken,
  getTokenMaxAge,
  isAccessTokenExpired,
} from '../token-utils'

const createToken = (payload: { [key: string]: unknown }): string => {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  )

  return `${header}.${encodedPayload}.signature`
}

describe('auth token utils', () => {
  it('extracts the username from a valid access token payload', () => {
    const token = createToken({ sub: 'alice', exp: 4_102_444_800 })

    expect(extractUsernameFromAccessToken(token)).toBe('alice')
  })

  it('returns null for malformed access tokens', () => {
    expect(extractUsernameFromAccessToken('not-a-jwt')).toBeNull()
  })

  it('detects expired and active tokens based on exp', () => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const activeToken = createToken({ sub: 'alice', exp: nowSeconds + 120 })
    const expiredToken = createToken({ sub: 'alice', exp: nowSeconds - 120 })

    expect(isAccessTokenExpired(activeToken)).toBe(false)
    expect(isAccessTokenExpired(expiredToken)).toBe(true)
  })

  it('uses the fallback max age when the token cannot be decoded', () => {
    expect(getTokenMaxAge('invalid-token', 900)).toBe(900)
  })

  it('calculates token max age from exp and never goes below zero', () => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const activeToken = createToken({ exp: nowSeconds + 60 })
    const expiredToken = createToken({ exp: nowSeconds - 60 })

    expect(getTokenMaxAge(activeToken, 900)).toBeLessThanOrEqual(60)
    expect(getTokenMaxAge(activeToken, 900)).toBeGreaterThanOrEqual(0)
    expect(getTokenMaxAge(expiredToken, 900)).toBe(0)
  })
})
