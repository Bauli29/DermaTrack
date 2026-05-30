import { act, type ReactNode, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import Header from '..'

import { PageTitleProvider } from '@/context/page-title'
import { ThemeContextProvider } from '@/context/theme'
import { usePageTitle } from '@/hooks/use-page-title'
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

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
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

  const PageTitleController = ({
    title,
    backLink,
    parentTitle,
  }: {
    title: string
    backLink?: string
    parentTitle?: string
  }) => {
    const { setBackLink, setParentTitle, setTitle } = usePageTitle()

    useEffect(() => {
      setTitle(title)
      setBackLink(backLink ?? null)
      setParentTitle(parentTitle ?? null)
    }, [backLink, parentTitle, setBackLink, setParentTitle, setTitle, title])

    return null
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
    mockPush.mockClear()
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

  it('renders the page title and navigates through the brand', () => {
    renderWithProviders(
      <>
        <PageTitleController title='Timeline' />
        <Header brandLogoSrc='/logo.png' />
      </>
    )

    const title = container.querySelector('h1')
    const brandButton = container.querySelector('[aria-label="Go to Home"]')

    expect(title?.textContent).toBe('Timeline')

    act(() => {
      brandButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('renders a back action with the configured parent title', () => {
    renderWithProviders(
      <>
        <PageTitleController
          title='Daily Tracking'
          backLink='/timeline'
          parentTitle='Timeline'
        />
        <Header showBrand={false} />
      </>
    )

    const backButton = container.querySelector('button')

    expect(backButton?.textContent).toContain('Timeline')

    act(() => {
      backButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(mockPush).toHaveBeenCalledWith('/timeline')
  })
})
