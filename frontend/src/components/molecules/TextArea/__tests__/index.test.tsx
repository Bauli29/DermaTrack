import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import TextArea from '..'

import { lightTheme } from '@/lib/themes'

describe('TextArea', () => {
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

  it('connects label, helper text and error state accessibly', () => {
    renderWithTheme(
      <TextArea
        id='symptom-notes'
        label='Symptom notes'
        helperText='Describe your symptoms.'
        validation='error'
        placeholder='Describe symptoms'
      />
    )

    const label = container.querySelector('label')
    const textarea = container.querySelector('textarea')
    const helper = container.querySelector('#symptom-notes-helper')

    expect(label?.getAttribute('for')).toBe('symptom-notes')
    expect(textarea?.getAttribute('aria-invalid')).toBe('true')
    expect(textarea?.getAttribute('aria-describedby')).toBe(
      'symptom-notes-helper'
    )
    expect(helper?.textContent).toBe('Describe your symptoms.')
    expect(container.textContent).toContain('cancel')
  })

  it('renders success and disabled states with configured rows', () => {
    renderWithTheme(
      <TextArea
        label='Care notes'
        validation='success'
        rows={6}
        disabled
        defaultValue='No irritation today.'
      />
    )

    const textarea = container.querySelector(
      'textarea'
    ) as HTMLTextAreaElement | null

    expect(textarea?.rows).toBe(6)
    expect(textarea?.disabled).toBe(true)
    expect(textarea?.getAttribute('aria-invalid')).toBe('false')
    expect(container.textContent).toContain('check_circle')
  })
})
