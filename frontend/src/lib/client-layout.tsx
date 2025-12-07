'use client'
import { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'

import Header from '@/components/organisms/Header'
import NavBar from '@/components/organisms/Navbar'

import GlobalStyle from '@/app/global-style'

import { ThemeContextProvider } from '@/context/theme'
import { PageTitleProvider } from '@/context/page-title'

import { useTheme } from '@/hooks/use-theme'

const ThemedWrapper = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme()
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

const ClientLayout = ({ children }: { children: ReactNode }) => (
  <ThemeContextProvider>
    <PageTitleProvider>
      <ThemedWrapper>
        <GlobalStyle />
        <Header />
        {children}
        <NavBar />
      </ThemedWrapper>
    </PageTitleProvider>
  </ThemeContextProvider>
)

export default ClientLayout
