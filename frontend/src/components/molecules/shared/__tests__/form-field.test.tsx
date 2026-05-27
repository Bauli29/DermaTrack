import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import {
  Container,
  FieldWrapper,
  StatusIcon,
  validationFieldBaseStyles,
} from '../form-field'

import { lightTheme } from '@/lib/themes'

const StyledInput = require('styled-components').default.input`
  ${validationFieldBaseStyles}
`

describe('form field shared styles', () => {
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

  it('renders layout helpers with optional sizing props and visible status icon', () => {
    act(() => {
      root.render(
        <ThemeProvider theme={lightTheme}>
          <Container $fullWidth $margin='1rem' $maxWidth='24rem'>
            <FieldWrapper>
              <StyledInput $validation='success' />
              <StatusIcon $visible>check</StatusIcon>
            </FieldWrapper>
          </Container>
        </ThemeProvider>
      )
    })

    expect(container.textContent).toContain('check')
    expect(container.querySelector('input')).not.toBeNull()
  })

  it('renders disabled and error states without optional container styles', () => {
    act(() => {
      root.render(
        <ThemeProvider theme={lightTheme}>
          <Container $fullWidth={false}>
            <StyledInput $validation='error' $disabled />
            <StatusIcon $visible={false}>error</StatusIcon>
          </Container>
        </ThemeProvider>
      )
    })

    expect(container.querySelector('input')).not.toBeNull()
    expect(container.textContent).toContain('error')
  })
})
