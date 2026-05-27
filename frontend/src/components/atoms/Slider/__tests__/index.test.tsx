import { act, type ReactNode, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import Slider from '..'

import { lightTheme } from '@/lib/themes'

describe('Slider', () => {
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

  const mockSliderRect = (wrapper: HTMLDivElement) => {
    Object.defineProperty(wrapper, 'getBoundingClientRect', {
      configurable: true,
      value: () =>
        ({
          left: 10,
          right: 110,
          width: 100,
          top: 0,
          bottom: 20,
          height: 20,
        }) as DOMRect,
    })
  }

  it('updates by mouse position and keyboard interaction', () => {
    const changes: number[] = []

    const TestHarness = () => {
      const [value, setValue] = useState(50)

      return (
        <Slider
          value={value}
          min={0}
          max={100}
          step={10}
          aria-label='Symptom intensity'
          onChange={nextValue => {
            changes.push(nextValue)
            setValue(nextValue)
          }}
        />
      )
    }

    renderWithTheme(<TestHarness />)

    const wrapper = container.firstElementChild as HTMLDivElement
    const thumb = container.querySelector(
      '[role="slider"]'
    ) as HTMLDivElement | null
    mockSliderRect(wrapper)

    act(() => {
      wrapper.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: 90,
        })
      )
    })

    expect(changes).toContain(80)
    expect(thumb?.getAttribute('aria-valuenow')).toBe('80')

    act(() => {
      thumb?.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'ArrowLeft',
        })
      )
    })

    expect(changes).toContain(70)
    expect(thumb?.getAttribute('aria-valuenow')).toBe('70')
  })

  it('ignores input when disabled', () => {
    const onChange = jest.fn()
    const onKeyDown = jest.fn()

    renderWithTheme(
      <Slider
        value={40}
        disabled
        aria-label='Disabled slider'
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    )

    const wrapper = container.firstElementChild as HTMLDivElement
    const thumb = container.querySelector(
      '[role="slider"]'
    ) as HTMLDivElement | null
    mockSliderRect(wrapper)

    act(() => {
      wrapper.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: 90,
        })
      )
      thumb?.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'ArrowRight',
        })
      )
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(thumb?.getAttribute('aria-disabled')).toBe('true')
    expect(thumb?.tabIndex).toBe(-1)
  })
})
