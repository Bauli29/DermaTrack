import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import DateCalendarPicker from '..'

import { lightTheme } from '@/lib/themes'

const datePickerProps: {
  selected: Date | null
  maxDate: Date
  onChange: (date: Date | null) => void
  ariaInvalid?: string
  ariaDescribedBy?: string
  className?: string
}[] = []

jest.mock('react-datepicker/dist/react-datepicker.css', () => ({}))

jest.mock('react-datepicker', () => ({
  __esModule: true,
  default: jest.fn(props => {
    datePickerProps.push(props)

    return (
      <button
        type='button'
        className={props.className}
        aria-invalid={props.ariaInvalid}
        aria-describedby={props.ariaDescribedBy}
        onClick={() => props.onChange(new Date(2026, 4, 27))}
      >
        {props.selected ? props.selected.toISOString() : props.placeholderText}
      </button>
    )
  }),
}))

describe('DateCalendarPicker', () => {
  let container: HTMLDivElement
  let root: Root

  const renderWithTheme = (element: ReactNode) => {
    act(() => {
      root.render(<ThemeProvider theme={lightTheme}>{element}</ThemeProvider>)
    })
  }

  beforeEach(() => {
    datePickerProps.length = 0
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

  it('parses valid dates and emits formatted changes', () => {
    const onChange = jest.fn()

    renderWithTheme(
      <DateCalendarPicker
        value='2026-05-26'
        maxDate='2026-05-31'
        onChange={onChange}
        ariaInvalid
        ariaDescribedBy='date-error'
      />
    )

    expect(datePickerProps[0].selected?.getFullYear()).toBe(2026)
    expect(datePickerProps[0].selected?.getMonth()).toBe(4)
    expect(datePickerProps[0].selected?.getDate()).toBe(26)
    expect(datePickerProps[0].maxDate.getDate()).toBe(31)
    expect(datePickerProps[0].ariaInvalid).toBe('true')
    expect(datePickerProps[0].ariaDescribedBy).toBe('date-error')

    act(() => {
      container
        .querySelector('button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onChange).toHaveBeenCalledWith('2026-05-27')
  })

  it('falls back for invalid inputs and ignores empty selections', () => {
    const onChange = jest.fn()

    renderWithTheme(
      <DateCalendarPicker
        value='2026-02-31'
        maxDate='invalid'
        onChange={onChange}
      />
    )

    expect(datePickerProps[0].selected).toBeNull()
    expect(datePickerProps[0].maxDate).toBeInstanceOf(Date)

    act(() => {
      datePickerProps[0].onChange(null)
    })

    expect(onChange).not.toHaveBeenCalled()
  })
})
