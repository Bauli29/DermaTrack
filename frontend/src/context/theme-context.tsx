'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { TThemeName } from '@/lib/themes'
import {
  getTheme,
  getSystemTheme,
  saveThemePreference,
  getThemePreference,
} from '@/lib/theme-utils'
import { DefaultTheme } from 'styled-components'

interface ThemeContextType {
  theme: DefaultTheme
  themeName: TThemeName
  toggleTheme: () => void
  setTheme: (themeName: TThemeName) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

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

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
