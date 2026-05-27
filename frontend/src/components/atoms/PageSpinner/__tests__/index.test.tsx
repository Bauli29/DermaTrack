import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import PageSpinner from '..'

import { lightTheme } from '@/lib/themes'

describe('PageSpinner', () => {
  let container: HTMLDivElement
  let root: Root

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

  it('renders a themed loading indicator', () => {
    act(() => {
      root.render(
        <ThemeProvider theme={lightTheme}>
          <PageSpinner />
        </ThemeProvider>
      )
    })

    expect(container.querySelector('span')).not.toBeNull()
  })
})
