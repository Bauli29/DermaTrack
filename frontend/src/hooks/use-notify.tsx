'use client'

import { useContext } from 'react'

import { NotificationContext } from '../context/notification-context'

export const useNotify = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotify must be used within a NotificationContextProvider'
    )
  }
  return context
}
