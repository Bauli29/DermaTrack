'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { AUTH_CONTEXT_DEFAULT_VALUE, AUTH_CONTEXT_INITIAL_STATE } from './types'
import { AUTH_API_PATHS, loadSession, requestAuth } from './api'
import {
  createAuthErrorState,
  createCompletedAuthState,
  createLoadingAuthState,
  createLoggedOutAuthState,
  createSessionAuthState,
  normalizeAuthActionError,
} from './state-utils'

import type {
  IAuthContext,
  IAuthContextState,
  ILoginRequest,
  IRegisterRequest,
  ISessionResponse,
} from '@/types/auth'
import type { IAuthError } from '@/types/errors'

/**
 * Auth context for global auth state management
 */
export const AuthContext = createContext<IAuthContext>(
  AUTH_CONTEXT_DEFAULT_VALUE
)

interface IAuthContextProviderProps {
  children: ReactNode
}

/**
 * AuthContextProvider component
 * Wraps app and provides auth state + methods to all children
 * Handles session initialization and validation
 */
export const AuthContextProvider = ({
  children,
}: IAuthContextProviderProps) => {
  const [state, setState] = useState<IAuthContextState>(
    AUTH_CONTEXT_INITIAL_STATE
  )

  const setLoadingState = useCallback((isLoading: boolean) => {
    setState(prev => createLoadingAuthState(prev, isLoading))
  }, [])

  const applySessionState = useCallback((session: ISessionResponse | null) => {
    setState(createSessionAuthState(session))
  }, [])

  const finalizeAuthAction = useCallback(() => {
    setState(prev => createCompletedAuthState(prev))
  }, [])

  const setAuthActionError = useCallback(
    (error: unknown, fallbackMessage: string): IAuthError => {
      const authError = normalizeAuthActionError(error, fallbackMessage)

      setState(prev => createAuthErrorState(prev, authError))

      return authError
    },
    []
  )

  const initializeSession = useCallback(async () => {
    try {
      const session = await loadSession()
      applySessionState(session)
    } catch {
      setState(AUTH_CONTEXT_INITIAL_STATE)
    }
  }, [applySessionState])

  useEffect(() => {
    void initializeSession()
  }, [initializeSession])

  const executeAuthAction = useCallback(
    async ({
      request,
      onSuccess,
      fallbackMessage,
    }: {
      request: () => Promise<unknown>
      onSuccess: () => Promise<void> | void
      fallbackMessage: string
    }) => {
      setLoadingState(true)

      try {
        await request()
        await onSuccess()
      } catch (error) {
        throw setAuthActionError(error, fallbackMessage)
      }
    },
    [setAuthActionError, setLoadingState]
  )

  const login = useCallback(
    async (username: string, password: string) => {
      const payload: ILoginRequest = { username, password }

      await executeAuthAction({
        request: () =>
          requestAuth(AUTH_API_PATHS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(payload),
          }),
        onSuccess: initializeSession,
        fallbackMessage: 'Login failed',
      })
    },
    [executeAuthAction, initializeSession]
  )

  /**
   * Register implementation (called by register API route)
   */
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const payload: IRegisterRequest = { username, email, password }

      await executeAuthAction({
        request: () =>
          requestAuth(AUTH_API_PATHS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(payload),
          }),
        onSuccess: finalizeAuthAction,
        fallbackMessage: 'Registration failed',
      })
    },
    [executeAuthAction, finalizeAuthAction]
  )

  /**
   * Logout implementation
   * Called by logout API route or manually
   */
  const logout = useCallback(async () => {
    setLoadingState(true)

    try {
      await requestAuth(AUTH_API_PATHS.LOGOUT, {
        method: 'POST',
      })
    } catch {
      // Always clear local session state even if backend logout fails.
    } finally {
      setState(createLoggedOutAuthState())
    }
  }, [setLoadingState])

  /**
   * Refetch current session (validate tokens are still valid)
   */
  const refetch = useCallback(async () => {
    await initializeSession()
  }, [initializeSession])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }))
  }, [])

  const contextValue: IAuthContext = {
    ...state,
    login,
    register,
    logout,
    refetch,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
