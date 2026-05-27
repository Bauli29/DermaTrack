import { act, type ReactNode, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import CompoundCheckboxes from '..'

import { lightTheme } from '@/lib/themes'

describe('CompoundCheckboxes', () => {
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

  it('adds and removes values while showing detail inputs only for selected options', () => {
    const TestHarness = () => {
      const [selectedValues, setSelectedValues] = useState<string[]>(['dust'])
      const [animalDetails, setAnimalDetails] = useState('')

      return (
        <CompoundCheckboxes
          name='contact-factors'
          legend='Contact factors'
          helperText='Select all contact factors that apply.'
          values={selectedValues}
          onChange={setSelectedValues}
          options={[
            { value: 'dust', label: 'Dust' },
            {
              value: 'animal-contact',
              label: 'Animal Contact',
              helperText: 'Pets or other animals',
              detailInput: {
                placeholder: 'Describe animal contact',
                value: animalDetails,
                onChange: setAnimalDetails,
              },
            },
          ]}
        />
      )
    }

    renderWithTheme(<TestHarness />)

    const dustCheckbox = container.querySelector(
      'input[type="checkbox"][value="dust"]'
    ) as HTMLInputElement | null
    const animalCheckbox = container.querySelector(
      'input[type="checkbox"][value="animal-contact"]'
    ) as HTMLInputElement | null

    expect(dustCheckbox?.checked).toBe(true)
    expect(animalCheckbox?.checked).toBe(false)
    expect(container.textContent).toContain('Contact factors')
    expect(container.textContent).toContain(
      'Select all contact factors that apply.'
    )
    expect(
      container.querySelector('input[placeholder="Describe animal contact"]')
    ).toBeNull()

    act(() => {
      animalCheckbox?.click()
    })

    const detailInput = container.querySelector(
      'input[placeholder="Describe animal contact"]'
    ) as HTMLInputElement | null

    expect(animalCheckbox?.checked).toBe(true)
    expect(detailInput).not.toBeNull()
    expect(animalCheckbox?.getAttribute('aria-expanded')).toBe('true')

    act(() => {
      if (!detailInput) {
        return
      }

      detailInput.value = 'Cat hair'
      detailInput.dispatchEvent(new Event('input', { bubbles: true }))
      detailInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(
      (
        container.querySelector(
          'input[placeholder="Describe animal contact"]'
        ) as HTMLInputElement | null
      )?.value
    ).toBe('Cat hair')

    act(() => {
      dustCheckbox?.click()
    })

    expect(dustCheckbox?.checked).toBe(false)
    expect(animalCheckbox?.checked).toBe(true)
  })

  it('disables checkboxes and nested detail inputs when requested', () => {
    renderWithTheme(
      <CompoundCheckboxes
        name='care-products'
        values={['cream']}
        disabled
        onChange={jest.fn()}
        options={[
          {
            value: 'cream',
            label: 'Cream',
            detailInput: {
              label: 'Product name',
              value: 'Moisturizer',
              onChange: jest.fn(),
            },
          },
        ]}
      />
    )

    expect(
      (
        container.querySelector(
          'input[type="checkbox"]'
        ) as HTMLInputElement | null
      )?.disabled
    ).toBe(true)
    expect(
      (container.querySelector('input[type="text"]') as HTMLInputElement | null)
        ?.disabled
    ).toBe(true)
  })
})
