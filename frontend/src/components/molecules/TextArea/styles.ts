'use client'
import styled, { css } from 'styled-components'

import type {
  IStatusIconProps,
  IStyledContainerProps,
  IStyledTextAreaProps,
  TValidationState,
} from './types'
import type { ITheme } from '@/lib/themes'

// Helper: map validation state to theme color keys
const getValidationColor = (state: TValidationState, theme: ITheme): string => {
  switch (state) {
    case 'success':
      return theme.colors.success
    case 'error':
      return theme.colors.error
    case 'none':
    default:
      return theme.colors.border
  }
}

export const Container = styled.div<IStyledContainerProps>`
  display: flex;
  flex-direction: column;
  ${({ $fullWidth }) => ($fullWidth ? 'width: 100%;' : 'width: auto;')}
  ${({ $margin }) => $margin && `margin: ${$margin};`}
  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth};`}
`

// Wraps the actual textarea so we can position the status icon on the right
export const FieldWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
`

export const StyledTextArea = styled.textarea<IStyledTextAreaProps>`
  /* 1) Sizing & box model */
  width: 100%;
  /* default multi-line sizing; single-line variant will override these via prop */
  min-height: 6rem; /* ~96px: comfortable touch target for multi-line input */
  padding: 0.75rem 2.5rem 0.75rem 0.75rem; /* extra right padding to avoid overlapping the status icon */
  border-radius: 0.5rem; /* slightly more rounded than buttons for large field */

  /* If the single-line variant is requested, use a tighter height/padding and disable vertical resize */
  ${({ $singleLine }) =>
    $singleLine &&
    `
    /* enforce an exact height and hide vertical overflow to avoid scrollbars */
    min-height: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem 2.5rem 0.5rem 0.5rem;
    overflow-y: hidden;
    line-height: 1.4;
  `}
  border: 1px solid
    ${({ theme, $validation }) => getValidationColor($validation, theme)};
  box-sizing: border-box;
  /* control resize based on variant: single-line inputs shouldn't be resizable */
  resize: ${({ $singleLine }) => ($singleLine ? 'none' : 'vertical')};

  /* 2) Colors (from theme) */
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  /* 3) Typography (inherit app font, use readable line-height) */
  font: inherit; /* inherit family/weight from app */
  font-size: 1rem; /* 16px: WCAG recommended minimum */
  line-height: 1.6; /* matches Text atom's medium */

  /* 4) Placeholder styling */
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 1; /* avoid Safari/iOS additional dimming */
  }

  /* 5) Interaction states */
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.card};
    border-color: ${({ theme, $validation }) =>
      $validation === 'none'
        ? theme.colors.borderLight
        : getValidationColor($validation, theme)};
  }

  &:focus {
    outline: none;
    /* Use a soft focus ring; derive color from validation or theme focus */
    border-color: ${({ theme, $validation }) =>
      $validation === 'none'
        ? theme.colors.focus
        : getValidationColor($validation, theme)};
    box-shadow: 0 0 0 3px
      ${({ theme, $validation }) => {
        // Avoid nested ternary: choose base color explicitly
        let base = theme.colors.focus
        if ($validation === 'success') {
          base = theme.colors.success
        } else if ($validation === 'error') {
          base = theme.colors.error
        }
        // Append 33 (20% alpha) to hex if possible; fallback to base color
        return `${base}${base.startsWith('#') ? '33' : ''}`
      }};
    background: ${({ theme }) => theme.colors.surface};
  }

  /* 6) Disabled state */
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
  pointer-events: none; /* purely decorative status indicator */
`
