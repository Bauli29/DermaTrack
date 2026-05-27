import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import Input from '..'

import { lightTheme } from '@/lib/themes'

describe('Input', () => {
  let container: HTMLDivElement
  let root: Root

  const renderWithTheme = (element: ReactNode) => {
    act(() => {
      root.render(<ThemeProvider theme={lightTheme}>{element}</ThemeProvider>)
    })
  }

  beforeEach(() => {
    jest.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders label, helper text and error state attributes', () => {
    renderWithTheme(
      <Input
        id='password'
        label='Password'
        helperText='Password is required'
        validation='error'
        type='password'
        placeholder='Enter password'
      />
    )

    const input = container.querySelector('input') as HTMLInputElement | null
    const button = container.querySelector('button[aria-label="Show password"]')

    expect(container.querySelector('label')?.getAttribute('for')).toBe(
      'password'
    )
    expect(input?.type).toBe('password')
    expect(input?.getAttribute('aria-invalid')).toBe('true')
    expect(input?.getAttribute('aria-describedby')).toBe('password-helper')
    expect(container.textContent).toContain('Password is required')
    expect(button).not.toBeNull()
    expect(container.textContent).toContain('cancel')
  })

  it('toggles password visibility manually and by timeout', () => {
    renderWithTheme(<Input id='secret' type='password' />)

    const input = container.querySelector('input')!
    const button = container.querySelector('button')!

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(input.type).toBe('text')
    expect(button.getAttribute('aria-label')).toBe('Hide password')

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(input.type).toBe('password')

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      jest.advanceTimersByTime(3000)
    })

    expect(input.type).toBe('password')
  })

  it('renders plain disabled inputs without optional label or helper text', () => {
    renderWithTheme(<Input disabled fullWidth={false} validation='success' />)

    const input = container.querySelector('input') as HTMLInputElement | null

    expect(input?.disabled).toBe(true)
    expect(input?.getAttribute('aria-invalid')).toBe('false')
    expect(container.querySelector('label')).toBeNull()
  })
})
