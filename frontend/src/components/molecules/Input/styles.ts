'use client'
import styled from 'styled-components'

import type { IStyledInputProps } from './types'
import {
  Container,
  FieldWrapper,
  StatusIcon,
  validationFieldBaseStyles,
} from '../shared/form-field.styles'

export { Container, FieldWrapper, StatusIcon }

export const Input = styled.input<IStyledInputProps>`
  width: 100%;
  height: 2.5rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  line-height: 1.5;
  ${validationFieldBaseStyles}
`

export const ToggleButton = styled.button`
  position: absolute;
  top: 0;
  right: 2.25rem;
  bottom: 0;
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0 0.5rem;
  cursor: pointer;
  color: inherit;
  font: inherit;
  outline: none;

  &:focus {
    border-radius: 0.25rem;
    box-shadow: 0 0 0 3px
      ${({ theme }) =>
        `${theme.colors.focus}${theme.colors.focus.startsWith('#') ? '33' : ''}`};
  }
`
