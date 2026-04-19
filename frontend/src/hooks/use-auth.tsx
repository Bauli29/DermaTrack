'use client'

import { useContext } from 'react'

import { AuthContext } from '@/context/auth'

import type { IAuthContext } from '@/types/auth'

/**
 * Hook to access auth context
 * Must be used within AuthContextProvider
 *
 * @returns Auth context with user, isLoggedIn, isLoading, error, and methods
 * @throws Error if used outside of AuthContextProvider
 *
 * @example
 * const { isLoggedIn, user, login } = useAuth()
 * if (isLoggedIn) console.log(`Welcome ${user?.username}`)
 */
export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthContextProvider. Ensure <AuthContextProvider> wraps your application.'
    )
  }

  return context
}
