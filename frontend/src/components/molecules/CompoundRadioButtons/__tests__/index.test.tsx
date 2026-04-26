import { act, type ReactNode, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import CompoundRadioButtons from '..'

import { lightTheme } from '@/lib/themes'

describe('CompoundRadioButtons', () => {
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

  it('reveals and updates the nested input only for the selected option', () => {
    const TestHarness = () => {
      const [selectedValue, setSelectedValue] = useState('shower')
      const [animalContactDetails, setAnimalContactDetails] = useState('')

      return (
        <CompoundRadioButtons
          name='contact-factor'
          value={selectedValue}
          onChange={setSelectedValue}
          options={[
            { value: 'shower', label: 'Shower' },
            { value: 'clothing', label: 'Clothing' },
            {
              value: 'animal-contact',
              label: 'Animal Contact',
              detailInput: {
                placeholder: 'Text field ...',
                value: animalContactDetails,
                onChange: setAnimalContactDetails,
              },
            },
          ]}
        />
      )
    }

    renderWithTheme(<TestHarness />)

    expect(
      container.querySelector('input[placeholder="Text field ..."]')
    ).toBeNull()

    const animalContactRadio = container.querySelector(
      'input[type="radio"][value="animal-contact"]'
    ) as HTMLInputElement | null

    expect(animalContactRadio).not.toBeNull()

    act(() => {
      animalContactRadio?.click()
    })

    const detailsInput = container.querySelector(
      'input[placeholder="Text field ..."]'
    ) as HTMLInputElement | null

    expect(detailsInput).not.toBeNull()

    act(() => {
      if (!detailsInput) {
        return
      }

      detailsInput.value = 'Cat'
      detailsInput.dispatchEvent(new Event('input', { bubbles: true }))
      detailsInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(
      (
        container.querySelector(
          'input[placeholder="Text field ..."]'
        ) as HTMLInputElement | null
      )?.value
    ).toBe('Cat')

    const clothingRadio = container.querySelector(
      'input[type="radio"][value="clothing"]'
    ) as HTMLInputElement | null

    act(() => {
      clothingRadio?.click()
    })

    expect(
      container.querySelector('input[placeholder="Text field ..."]')
    ).toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
