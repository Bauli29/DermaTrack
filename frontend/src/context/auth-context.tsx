'use client'

import { createContext, ReactNode } from 'react'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IAuthContextType {
  // Auth context properties will go here
}

interface IAuthContextProviderProps {
  children: ReactNode
}

const AuthContext = createContext<IAuthContextType | undefined>(undefined)

export const AuthContextProvider = ({
  children,
}: IAuthContextProviderProps) => (
  <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
)

export { AuthContext }
