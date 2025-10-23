'use client'
import { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { ThemeContextProvider, useTheme } from '@/context/theme-context'

const ThemedWrapper = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme()
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

const ClientLayout = ({ children }: { children: ReactNode }) => (
  <ThemeContextProvider>
    <ThemedWrapper>{children}</ThemedWrapper>
  </ThemeContextProvider>
)

export default ClientLayout
