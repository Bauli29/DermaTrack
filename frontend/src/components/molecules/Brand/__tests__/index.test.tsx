import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import Brand from '..'

import { lightTheme } from '@/lib/themes'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    src,
  }: {
    alt: string
    src: string
    fill?: boolean
    sizes?: string
  }) => (
    <span aria-label={alt} data-testid='next-image' data-src={src}>
      {alt}
    </span>
  ),
}))

describe('Brand', () => {
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

  it('renders a clickable logo image when a logo source is provided', () => {
    const onClick = jest.fn()

    renderWithTheme(
      <Brand
        name='DermaTrack'
        logoSrc='/logo.png'
        size='lg'
        onClick={onClick}
      />
    )

    const image = container.querySelector('[data-testid="next-image"]')
    const button = container.querySelector('[role="button"]')

    expect(image?.getAttribute('data-src')).toBe('/logo.png')
    expect(image?.getAttribute('aria-label')).toBe('DermaTrack')
    expect(button?.getAttribute('aria-label')).toBe('Go to Home')

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the fallback avatar without button semantics when no click handler is set', () => {
    renderWithTheme(<Brand />)

    expect(container.textContent).toContain('DT')
    expect(container.querySelector('[role="button"]')).toBeNull()
  })
})
