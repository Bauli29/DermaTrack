'use client'

import styled, { css } from 'styled-components'

import type { ITheme } from '@/lib/themes'
import type {
  IStatusIconProps,
  IStyledContainerProps,
  IStyledValidationFieldProps,
  TValidationState,
} from './form-field.types'

const getValidationColor = (state: TValidationState, theme: ITheme): string => {
  if (state === 'success') return theme.colors.success
  if (state === 'error') return theme.colors.error
  return theme.colors.border
}

const getFocusShadowColor = (
  state: TValidationState,
  theme: ITheme
): string => {
  const baseColor =
    state === 'none' ? theme.colors.focus : getValidationColor(state, theme)
  return `${baseColor}${baseColor.startsWith('#') ? '33' : ''}`
}

export const validationFieldBaseStyles = css<IStyledValidationFieldProps>`
  border-radius: 0.5rem;
  border: 1px solid
    ${({ theme, $validation }) => getValidationColor($validation, theme)};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  font-size: 1rem;
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
      ${({ theme, $validation }) => getFocusShadowColor($validation, theme)};
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
