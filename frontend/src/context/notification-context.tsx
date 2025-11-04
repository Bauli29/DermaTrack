'use client'

import { createContext, ReactNode } from 'react'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface INotificationContextType {
  // Notification context properties will go here
}

interface INotificationContextProviderProps {
  children: ReactNode
}

const NotificationContext = createContext<INotificationContextType | undefined>(
  undefined
)

export const NotificationContextProvider = ({
  children,
}: INotificationContextProviderProps) => (
  <NotificationContext.Provider value={{}}>
    {children}
  </NotificationContext.Provider>
)

export { NotificationContext }
