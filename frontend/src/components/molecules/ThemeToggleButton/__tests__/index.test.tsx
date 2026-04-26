import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import ThemeToggleButton from '..'

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

describe('ThemeToggleButton', () => {
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
          <ThemedHarness>{element}</ThemedHarness>
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

  it('toggles the theme label, icon, and persisted preference', () => {
    renderWithProviders(<ThemeToggleButton />)

    const button = container.querySelector('button')

    expect(button?.getAttribute('aria-label')).toBe('Switch to dark mode')
    expect(button?.getAttribute('aria-pressed')).toBe('false')
    expect(button?.textContent?.trim()).toBe('dark_mode')

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const updatedButton = container.querySelector('button')

    expect(updatedButton?.getAttribute('aria-label')).toBe(
      'Switch to light mode'
    )
    expect(updatedButton?.getAttribute('aria-pressed')).toBe('true')
    expect(updatedButton?.textContent?.trim()).toBe('light_mode')
    expect(window.localStorage.getItem('theme-preference')).toBe('dark')
  })
})
