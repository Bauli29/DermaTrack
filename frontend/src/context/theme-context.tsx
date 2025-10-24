'use client'
import { createContext, ReactNode, useEffect, useState } from 'react'
import { DefaultTheme } from 'styled-components'

import {
  getSystemTheme,
  getTheme,
  getThemePreference,
  saveThemePreference,
} from '@/lib/theme-utils'
import { TThemeName } from '@/lib/themes'

interface ThemeContextType {
  theme: DefaultTheme
  themeName: TThemeName
  toggleTheme: () => void
  setTheme: (themeName: TThemeName) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
)

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<TThemeName>('light')

  useEffect(() => {
    const savedTheme = getThemePreference()
    const initialTheme = savedTheme ?? getSystemTheme()
    setThemeName(initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light'
    setThemeName(newTheme)
    saveThemePreference(newTheme)
  }

  const setTheme = (newTheme: TThemeName) => {
    setThemeName(newTheme)
    saveThemePreference(newTheme)
  }

  const theme = getTheme(themeName)

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
