import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import Navbar from '..'

import { useAuth } from '@/hooks/use-auth'
import { replaceBrowserLocation } from '@/lib/client-navigation'
import { lightTheme } from '@/lib/themes'

const logoutMock = jest.fn()

let pathname = '/timeline'
let authState = {
  isLoggedIn: false,
  isLoading: false,
  logout: logoutMock,
}

jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/client-navigation', () => ({
  replaceBrowserLocation: jest.fn(),
}))

describe('Navbar', () => {
  let container: HTMLDivElement
  let root: Root

  const renderWithTheme = (element: ReactNode) => {
    act(() => {
      root.render(<ThemeProvider theme={lightTheme}>{element}</ThemeProvider>)
    })
  }

  beforeEach(() => {
    pathname = '/timeline'
    authState = {
      isLoggedIn: false,
      isLoading: false,
      logout: logoutMock,
    }
    ;(useAuth as jest.Mock).mockImplementation(() => authState)
    ;(replaceBrowserLocation as jest.Mock).mockClear()
    logoutMock.mockReset().mockResolvedValue(undefined)
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('marks the active navigation item and renders default login link', () => {
    renderWithTheme(<Navbar />)

    const nav = container.querySelector('nav[aria-label="Main navigation"]')
    const activeLink = container.querySelector('a[aria-current="page"]')

    expect(nav).not.toBeNull()
    expect(activeLink?.textContent).toContain('Timeline')
    expect(container.querySelector('a[href="/login"]')?.textContent).toContain(
      'Login'
    )
  })

  it('uses exact href matching when no active pattern is configured', () => {
    pathname = '/custom'

    renderWithTheme(
      <Navbar
        items={[
          {
            href: '/custom',
            icon: 'star',
            label: 'Custom',
          },
        ]}
      />
    )

    expect(
      container.querySelector('a[aria-current="page"]')?.textContent
    ).toContain('Custom')
  })

  it('renders logout action for authenticated users and redirects after logout', async () => {
    authState = {
      isLoggedIn: true,
      isLoading: false,
      logout: logoutMock,
    }

    renderWithTheme(<Navbar />)

    const logoutButton = container.querySelector(
      'button[aria-label="Logout"]'
    ) as HTMLButtonElement | null

    expect(logoutButton?.disabled).toBe(false)
    expect(logoutButton?.textContent).toContain('Logout')

    await act(async () => {
      logoutButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(replaceBrowserLocation).toHaveBeenCalledWith('/login')
  })

  it('disables logout action while auth state is loading', () => {
    authState = {
      isLoggedIn: true,
      isLoading: true,
      logout: logoutMock,
    }

    renderWithTheme(<Navbar />)

    expect(
      container.querySelector<HTMLButtonElement>('button[aria-label="Logout"]')!
        .disabled
    ).toBe(true)
  })
})
