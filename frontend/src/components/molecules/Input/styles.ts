'use client'
import styled from 'styled-components'

import type { IStyledInputProps } from './types'
import {
  Container,
  FieldWrapper,
  StatusIcon,
  validationFieldBaseStyles,
} from '../shared/form-field'

export { Container, FieldWrapper, StatusIcon }

export const Input = styled.input<IStyledInputProps>`
  width: 100%;
  height: 2.5rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  line-height: 1.5;
  ${validationFieldBaseStyles}
`
