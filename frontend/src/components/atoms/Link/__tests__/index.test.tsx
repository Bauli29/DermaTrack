import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import Link from '..'

import { lightTheme } from '@/lib/themes'

describe('Link', () => {
  let container: HTMLDivElement
  let root: Root

  const renderWithTheme = (element: ReactNode) => {
    act(() => {
      root.render(<ThemeProvider theme={lightTheme}>{element}</ThemeProvider>)
    })
  }

  beforeEach(() => {
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

  it('renders external links with safe target attributes and optional icon', () => {
    renderWithTheme(
      <Link href='https://example.com' showExternalIcon>
        External docs
      </Link>
    )

    const anchor = container.querySelector('a') as HTMLAnchorElement | null

    expect(anchor?.href).toBe('https://example.com/')
    expect(anchor?.target).toBe('_blank')
    expect(anchor?.rel).toBe('noopener noreferrer')
    expect(anchor?.getAttribute('aria-disabled')).toBe('false')
    expect(container.textContent).toContain('External docs')
    expect(container.textContent).toContain('open_in_new')
  })

  it('prevents navigation for disabled internal links', () => {
    const onClick = jest.fn()

    renderWithTheme(
      <Link href='/dashboard' disabled onClick={onClick}>
        Dashboard
      </Link>
    )

    const anchor = container.querySelector('a') as HTMLAnchorElement | null
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })

    act(() => {
      anchor?.dispatchEvent(clickEvent)
    })

    expect(anchor?.getAttribute('href')).toBe('#')
    expect(anchor?.getAttribute('aria-disabled')).toBe('true')
    expect(clickEvent.defaultPrevented).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
  })
})
