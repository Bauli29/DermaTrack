'use client'
import { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'

import Header from '@/components/organisms/Header'
import NavBar from '@/components/organisms/Navbar'

import GlobalStyle from '@/app/global-style'

import { ThemeContextProvider } from '@/context/theme-context'

import { useTheme } from '@/hooks/use-theme'

const ThemedWrapper = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme()
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

const ClientLayout = ({ children }: { children: ReactNode }) => (
  <ThemeContextProvider>
    <ThemedWrapper>
      <GlobalStyle />
      <Header />
      {children}
      <NavBar />
    </ThemedWrapper>
  </ThemeContextProvider>
)

export default ClientLayout
