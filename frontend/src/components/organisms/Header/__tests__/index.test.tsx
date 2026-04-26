import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import Header from '..'

import { PageTitleProvider } from '@/context/page-title'
import { ThemeContextProvider } from '@/context/theme'
import { useTheme } from '@/hooks/use-theme'

const actEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

const createMatchMedia = () =>
  jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn().mockReturnValue(false),
  }))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Header', () => {
  let container: HTMLDivElement
  let root: Root

  const ThemedHarness = ({ children }: { children: ReactNode }) => {
    const { theme } = useTheme()

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
  }

  const renderWithProviders = (element: ReactNode) => {
    act(() => {
      root.render(
        <ThemeContextProvider>
          <ThemedHarness>
            <PageTitleProvider>{element}</PageTitleProvider>
          </ThemedHarness>
        </ThemeContextProvider>
      )
    })
  }

  beforeEach(() => {
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia(),
    })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    window.localStorage.clear()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders the global theme toggle in the header', () => {
    renderWithProviders(<Header showBrand={false} />)

    const button = container.querySelector(
      'button[aria-label="Switch to dark mode"]'
    )

    expect(button).not.toBeNull()
  })
})
