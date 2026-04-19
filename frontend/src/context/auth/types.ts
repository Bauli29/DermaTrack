/**
 * Auth-specific context types
 * Separate from main auth types for context organizational purposes
 */

import type { IAuthContext, IAuthContextState } from '@/types/auth'

/**
 * Initial/default state for auth context
 */
export const AUTH_CONTEXT_INITIAL_STATE: IAuthContextState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,
}

/**
 * Default auth context value
 */
export const AUTH_CONTEXT_DEFAULT_VALUE: IAuthContext = {
  ...AUTH_CONTEXT_INITIAL_STATE,
  login: async () => {
    throw new Error('AuthContext not initialized')
  },
  register: async () => {
    throw new Error('AuthContext not initialized')
  },
  logout: async () => {
    throw new Error('AuthContext not initialized')
  },
  refetch: async () => {
    throw new Error('AuthContext not initialized')
  },
  clearError: () => {
    throw new Error('AuthContext not initialized')
  },
}
