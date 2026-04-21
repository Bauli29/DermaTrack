'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  createAuthError,
  EAuthErrorCode,
  formatErrorMessage,
  isAuthError,
  parseApiError,
} from '@/types/errors'

import { AUTH_CONTEXT_DEFAULT_VALUE, AUTH_CONTEXT_INITIAL_STATE } from './types'

import type {
  IAuthContext,
  IAuthContextState,
  ILoginRequest,
  IRegisterRequest,
} from '@/types/auth'
import type { IUser } from '@/types/auth'
import type { IApiErrorResponse, IAuthError } from '@/types/errors'

interface ISessionResponse {
  isLoggedIn: boolean
  user: IUser | null
}

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
    setState(prev => ({
      ...prev,
      isLoading,
      error: isLoading ? null : prev.error,
    }))
  }, [])

  const parseResponseError = useCallback(async (response: Response) => {
    const fallbackMessage = 'Authentication request failed'
    const body = (await response
      .json()
      .catch(() => null)) as IApiErrorResponse | null

    if (body) {
      return parseApiError(body, response.status)
    }

    return createAuthError(
      EAuthErrorCode.UNKNOWN_ERROR,
      fallbackMessage,
      response.status
    )
  }, [])

  const requestAuth = useCallback(
    async <T,>(path: string, options: RequestInit): Promise<T> => {
      const response = await fetch(path, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw await parseResponseError(response)
      }

      if (response.status === 204) {
        return {} as T
      }

      return (await response.json()) as T
    },
    [parseResponseError]
  )

  const initializeSession = useCallback(async () => {
    try {
      let response = await fetch('/api/auth/session', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      })

      if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })

        if (refreshResponse.ok) {
          response = await fetch('/api/auth/session', {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include',
          })
        }
      }

      if (!response.ok) {
        setState(AUTH_CONTEXT_INITIAL_STATE)
        return
      }

      const data = (await response.json()) as ISessionResponse
      setState({
        user: data.user,
        isLoggedIn: data.isLoggedIn,
        isLoading: false,
        error: null,
      })
    } catch {
      setState(AUTH_CONTEXT_INITIAL_STATE)
    }
  }, [])

  useEffect(() => {
    void initializeSession()
  }, [initializeSession])

  const login = useCallback(
    async (username: string, password: string) => {
      setLoadingState(true)

      try {
        const payload: ILoginRequest = { username, password }
        await requestAuth('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        await initializeSession()
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }))
      } catch (error) {
        const authError: IAuthError = isAuthError(error)
          ? error
          : createAuthError(EAuthErrorCode.UNKNOWN_ERROR, 'Login failed')

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: formatErrorMessage(authError),
        }))
        throw authError
      }
    },
    [initializeSession, requestAuth, setLoadingState]
  )

  /**
   * Register implementation (called by register API route)
   */
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setLoadingState(true)

      try {
        const payload: IRegisterRequest = { username, email, password }
        await requestAuth('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }))
      } catch (error) {
        const authError: IAuthError = isAuthError(error)
          ? error
          : createAuthError(EAuthErrorCode.UNKNOWN_ERROR, 'Registration failed')

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: formatErrorMessage(authError),
        }))
        throw authError
      }
    },
    [requestAuth, setLoadingState]
  )

  /**
   * Logout implementation
   * Called by logout API route or manually
   */
  const logout = useCallback(async () => {
    setLoadingState(true)

    try {
      await requestAuth('/api/auth/logout', {
        method: 'POST',
      })
    } catch {
      // Always clear local session state even if backend logout fails.
    } finally {
      setState({
        ...AUTH_CONTEXT_INITIAL_STATE,
        isLoading: false,
      })
    }
  }, [requestAuth, setLoadingState])

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
