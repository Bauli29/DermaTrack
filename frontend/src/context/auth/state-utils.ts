'use client'

import {
  createAuthError,
  EAuthErrorCode,
  formatErrorMessage,
  isAuthError,
} from '@/types/errors'

import { AUTH_CONTEXT_INITIAL_STATE } from './types'

import type { IAuthContextState, ISessionResponse } from '@/types/auth'
import type { IAuthError } from '@/types/errors'

export const createLoadingAuthState = (
  state: IAuthContextState,
  isLoading: boolean
): IAuthContextState => ({
  ...state,
  isLoading,
  error: isLoading ? null : state.error,
})

export const createSessionAuthState = (
  session: ISessionResponse | null
): IAuthContextState => {
  if (!session) {
    return AUTH_CONTEXT_INITIAL_STATE
  }

  return {
    user: session.user,
    isLoggedIn: session.isLoggedIn,
    isLoading: false,
    error: null,
  }
}

export const createCompletedAuthState = (
  state: IAuthContextState
): IAuthContextState => ({
  ...state,
  isLoading: false,
  error: null,
})

export const createAuthErrorState = (
  state: IAuthContextState,
  error: IAuthError
): IAuthContextState => ({
  ...state,
  isLoading: false,
  error: formatErrorMessage(error),
})

export const createLoggedOutAuthState = (): IAuthContextState => ({
  ...AUTH_CONTEXT_INITIAL_STATE,
})

export const normalizeAuthActionError = (
  error: unknown,
  fallbackMessage: string
): IAuthError =>
  isAuthError(error)
    ? error
    : createAuthError(EAuthErrorCode.UNKNOWN_ERROR, fallbackMessage)
