'use client'
import { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'

import { ThemeContextProvider } from '@/context/theme-context'

import { useTheme } from '@/hooks/use-theme'
import Header from '@/components/organisms/Header'

const ThemedWrapper = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme()
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

const ClientLayout = ({ children }: { children: ReactNode }) => (
  <ThemeContextProvider>
    <ThemedWrapper>
      {/* Global app header shown on all pages (mobile-first) */}
      <Header />
      {children}
    </ThemedWrapper>
  </ThemeContextProvider>
)

export default ClientLayout
