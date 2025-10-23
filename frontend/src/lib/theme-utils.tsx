'use client'
import { DefaultTheme } from 'styled-components'
import { lightTheme, darkTheme, TThemeName } from './themes'

export const getTheme = (themeName: TThemeName): DefaultTheme => {
  switch (themeName) {
    case 'dark':
      return darkTheme
    case 'light':
    default:
      return lightTheme
  }
}

export const getSystemTheme = (): TThemeName => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return 'light'
}

export const saveThemePreference = (theme: TThemeName): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-preference', theme)
  }
}

const isValidTheme = (theme: string): theme is TThemeName =>
  theme === 'light' || theme === 'dark'

export const getThemePreference = (): TThemeName | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-preference')
    return stored && isValidTheme(stored) ? stored : null
  }
  return null
}
