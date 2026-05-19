// Provide a lightweight mock for `next/server` so tests don't load
// Next's Request polyfill (which isn't available in the Jest environment).
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: (url: URL) => ({
      headers: new Map([['location', String(url)]]),
    }),
    next: () => ({
      headers: new Map([['x-middleware-next', '1']]),
    }),
  },
}))

import type { NextRequest } from 'next/server'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'
import { proxy } from '@/proxy'

const createAccessToken = (expOffsetSeconds: number): string => {
  const payload = {
    sub: 'testuser',
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
  }

  return [
    'header',
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.')
}

const createRequest = (
  pathname: string,
  cookies: { [name: string]: string | undefined }
): NextRequest =>
  ({
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    cookies: {
      get: (name: string) =>
        cookies[name] ? { value: cookies[name] as string } : undefined,
    },
  }) as unknown as NextRequest

describe('proxy auth redirects', () => {
  it('allows /login when auth cookie is stale but access token is missing', () => {
    const response = proxy(
      createRequest('/login', {
        [AUTH_COOKIE_NAMES.AUTH_STATE]: '1',
      })
    )

    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('allows /login when access token is expired', () => {
    const response = proxy(
      createRequest('/login', {
        [AUTH_COOKIE_NAMES.AUTH_STATE]: '1',
        [AUTH_COOKIE_NAMES.ACCESS_TOKEN]: createAccessToken(-60),
      })
    )

    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('redirects authenticated users away from /login', () => {
    const response = proxy(
      createRequest('/login', {
        [AUTH_COOKIE_NAMES.AUTH_STATE]: '1',
        [AUTH_COOKIE_NAMES.ACCESS_TOKEN]: createAccessToken(60),
      })
    )

    expect(new URL(response.headers.get('location') ?? '').pathname).toBe('/')
  })

  it('redirects anonymous users on protected routes to /login', () => {
    const response = proxy(createRequest('/timeline', {}))

    const loc = response.headers.get('location') ?? ''
    const parsed = new URL(loc, 'http://localhost')
    expect(parsed.pathname + parsed.search).toBe('/login?next=%2Ftimeline')
  })
})
