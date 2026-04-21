import {
  createAuthErrorState,
  createCompletedAuthState,
  createLoadingAuthState,
  createLoggedOutAuthState,
  createSessionAuthState,
  normalizeAuthActionError,
} from '../state-utils'

import {
  createAuthError,
  EAuthErrorCode,
  formatErrorMessage,
} from '@/types/errors'

import type { IAuthContextState, ISessionResponse } from '@/types/auth'

const baseState: IAuthContextState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: 'Existing error',
}

describe('auth state utils', () => {
  it('creates loading state and clears stale error while loading', () => {
    expect(createLoadingAuthState(baseState, true)).toEqual({
      ...baseState,
      isLoading: true,
      error: null,
    })
  })

  it('creates completed state for successful auth actions', () => {
    expect(
      createCompletedAuthState({
        ...baseState,
        isLoading: true,
      })
    ).toEqual({
      ...baseState,
      isLoading: false,
      error: null,
    })
  })

  it('maps session payloads to auth state', () => {
    const session: ISessionResponse = {
      isLoggedIn: true,
      user: {
        id: '5',
        username: 'tester',
        email: 'tester@example.com',
        createdAt: '2026-04-21T00:00:00.000Z',
      },
    }

    expect(createSessionAuthState(session)).toEqual({
      user: session.user,
      isLoggedIn: true,
      isLoading: false,
      error: null,
    })
    expect(createSessionAuthState(null)).toEqual({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
    })
  })

  it('creates auth error state with formatted message', () => {
    const error = createAuthError(
      EAuthErrorCode.INVALID_CREDENTIALS,
      'Invalid credentials',
      401
    )

    expect(createAuthErrorState(baseState, error)).toEqual({
      ...baseState,
      isLoading: false,
      error: formatErrorMessage(error),
    })
  })

  it('creates logged out state', () => {
    expect(createLoggedOutAuthState()).toEqual({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
    })
  })

  it('preserves auth errors and normalizes unknown errors', () => {
    const authError = createAuthError(
      EAuthErrorCode.NETWORK_ERROR,
      'Network failed'
    )

    expect(normalizeAuthActionError(authError, 'Fallback')).toBe(authError)
    expect(normalizeAuthActionError(new Error('boom'), 'Fallback')).toEqual(
      createAuthError(EAuthErrorCode.UNKNOWN_ERROR, 'Fallback')
    )
  })
})
