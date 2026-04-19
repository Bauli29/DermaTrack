'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { setSessionInvalidCallback } from '@/lib/backend-client'
import {
  clearTokens,
  getAccessToken,
  getTokenUsername,
  hasValidAccessToken,
  setTokens,
} from '@/lib/token-storage'

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
  IAuthResponse,
  ILoginRequest,
  IRegisterRequest,
} from '@/types/auth'
import type { IUser } from '@/types/auth'
import type { IApiErrorResponse, IAuthError } from '@/types/errors'

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

  /**
   * Load session from localStorage on mount (SSR safe)
   * Validates that tokens exist and haven't expired
   */
  const initializeSession = useCallback(() => {
    const accessToken = getAccessToken()

    // No token = not logged in
    if (!accessToken || !hasValidAccessToken()) {
      clearTokens()
      setState(AUTH_CONTEXT_INITIAL_STATE)
      return
    }

    // Token exists and is valid
    const username = getTokenUsername(accessToken)
    if (username) {
      // Reconstruct user from token (minimal info)
      const user: IUser = {
        id: '', // We don't have full user data from token
        username,
        email: '', // We don't have email from token
        createdAt: '',
      }

      setState({
        user,
        isLoggedIn: true,
        isLoading: false,
        error: null,
      })
    } else {
      // Token is invalid
      clearTokens()
      setState(AUTH_CONTEXT_INITIAL_STATE)
    }
  }, [])

  /**
   * On mount: Initialize session from localStorage
   * Also set up callback for when backend returns 401
   */
  useEffect(() => {
    initializeSession()

    // When backend returns 401, mark session as invalid
    const handleSessionInvalid = () => {
      clearTokens()
      setState(AUTH_CONTEXT_INITIAL_STATE)
    }

    setSessionInvalidCallback(handleSessionInvalid)

    return () => {
      setSessionInvalidCallback(null)
    }
  }, [initializeSession])

  /**
   * Login implementation (called by login API route)
   * This is passed to Phase 4 API endpoints
   */
  const login = useCallback(
    async (username: string, password: string) => {
      setLoadingState(true)

      try {
        const payload: ILoginRequest = { username, password }
        const data = await requestAuth<IAuthResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        if (!data.accessToken || !data.refreshToken) {
          throw createAuthError(
            EAuthErrorCode.UNKNOWN_ERROR,
            'Invalid auth response from server',
            500
          )
        }

        setTokens(data.accessToken, data.refreshToken)
        initializeSession()
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
      const accessToken = getAccessToken()
      const headers: HeadersInit = accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}

      await requestAuth('/api/auth/logout', {
        method: 'POST',
        headers,
      })
    } catch {
      // Always clear local session state even if backend logout fails.
    } finally {
      clearTokens()
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
    initializeSession()
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
