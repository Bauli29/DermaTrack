'use client'
import styled, { css } from 'styled-components'

import type {
  IStatusIconProps,
  IStyledContainerProps,
  IStyledInputProps,
  TValidationState,
} from './types'
import type { ITheme } from '@/lib/themes'

const getValidationColor = (state: TValidationState, theme: ITheme): string => {
  if (state === 'success') return theme.colors.success
  if (state === 'error') return theme.colors.error
  return theme.colors.border
}

export const Container = styled.div<IStyledContainerProps>`
  display: flex;
  flex-direction: column;
  ${({ $fullWidth }) => ($fullWidth ? 'width: 100%;' : 'width: auto;')}
  ${({ $margin }) => $margin && `margin: ${$margin};`}
  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth};`}
`

export const FieldWrapper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
`

export const Input = styled.input<IStyledInputProps>`
  width: 100%;
  height: 2.5rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid
    ${({ theme, $validation }) => getValidationColor($validation, theme)};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  font-size: 1rem;
  line-height: 1.5;
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 1;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.card};
    border-color: ${({ theme, $validation }) =>
      $validation === 'none'
        ? theme.colors.borderLight
        : getValidationColor($validation, theme)};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $validation }) =>
      $validation === 'none'
        ? theme.colors.focus
        : getValidationColor($validation, theme)};
    box-shadow: 0 0 0 3px
      ${({ theme, $validation }) => {
        const base =
          $validation === 'none'
            ? theme.colors.focus
            : getValidationColor($validation, theme)
        return `${base}${base.startsWith('#') ? '33' : ''}`
      }};
    background: ${({ theme }) => theme.colors.surface};
  }

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    `}
`

export const StatusIcon = styled.div<IStatusIconProps>`
  position: absolute;
  top: 0;
  right: 0.5rem;
  bottom: 0;
  display: flex;
  align-items: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s ease;
  pointer-events: none;
`
