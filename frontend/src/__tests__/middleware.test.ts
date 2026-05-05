import { getAuthRedirectPath } from '@/lib/auth-route-guard'

describe('middleware auth guards', () => {
  it('redirects logged-in users from /login to /', () => {
    const redirectPath = getAuthRedirectPath('/login', true)
    expect(redirectPath).toBe('/')
  })

  it('redirects anonymous users from protected tracking route to /login', () => {
    const redirectPath = getAuthRedirectPath('/tracking/daily', false)
    expect(redirectPath).toBe('/login?next=%2Ftracking%2Fdaily')
  })

  it('redirects anonymous users from protected timeline route to /login', () => {
    const redirectPath = getAuthRedirectPath('/timeline', false)
    expect(redirectPath).toBe('/login?next=%2Ftimeline')
  })

  it('allows anonymous access to /swagger', () => {
    const redirectPath = getAuthRedirectPath('/swagger', false)
    expect(redirectPath).toBeNull()
  })
})
