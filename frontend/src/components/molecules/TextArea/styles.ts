'use client'
import styled from 'styled-components'

import type { IStyledTextAreaProps } from './types'
import {
  Container,
  FieldWrapper,
  StatusIcon,
  validationFieldBaseStyles,
} from '../shared/form-field.styles'

export { Container, FieldWrapper, StatusIcon }

export const TextArea = styled.textarea<IStyledTextAreaProps>`
  width: 100%;
  min-height: 6rem;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  line-height: 1.6;
  resize: none;
  overflow-y: auto;
  ${validationFieldBaseStyles}
`
