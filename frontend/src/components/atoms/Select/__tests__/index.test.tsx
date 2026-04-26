import { act, type ReactNode, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import Select from '..'

import { lightTheme } from '@/lib/themes'

describe('Select', () => {
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

  it('renders a placeholder and updates the selected option', () => {
    const TestHarness = () => {
      const [value, setValue] = useState('')

      return (
        <Select
          aria-label='Contact factor category'
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder='Choose a category'
          options={[
            { value: 'contact', label: 'Contact Factors' },
            { value: 'symptoms', label: 'Symptoms' },
          ]}
        />
      )
    }

    renderWithTheme(<TestHarness />)

    const select = container.querySelector('select') as HTMLSelectElement | null

    expect(select).not.toBeNull()
    expect(select?.value).toBe('')

    const placeholderOption = container.querySelector(
      'option[value=""]'
    ) as HTMLOptionElement | null

    expect(placeholderOption?.textContent).toBe('Choose a category')
    expect(placeholderOption?.disabled).toBe(true)

    act(() => {
      if (!select) {
        return
      }

      select.value = 'symptoms'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(select?.value).toBe('symptoms')

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
