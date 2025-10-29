'use client'
import styled, { css } from 'styled-components'

import { ITheme } from '@/lib/themes'

import { IButtonStyleProps } from './types'

const sizeStyles = {
  sm: css`
    height: 32px;
    padding: 0 12px;
    font-size: 0.875rem;
  `,
  md: css`
    height: 40px;
    padding: 0 16px;
    font-size: 0.9375rem;
  `,
  lg: css`
    height: 48px;
    padding: 0 20px;
    font-size: 1rem;
  `,
}

const variantStyles = (theme: ITheme) => ({
  primary: css`
    background: ${theme.colors.primary};
    color: ${theme.colors.text};
    border-color: ${theme.colors.primary};
  `,
  secondary: css`
    background: ${theme.colors.secondary};
    color: ${theme.colors.text};
    border-color: ${theme.colors.secondary};
  `,
  ghost: css`
    background: transparent;
    color: ${theme.colors.text};
  `,
  danger: css`
    background: ${theme.colors.error};
    color: ${theme.colors.text};
    border-color: ${theme.colors.error};
  `,
  'primary-outline': css`
    background: transparent;
    color: ${theme.colors.primary};
    border-color: ${theme.colors.primary};
  `,
  'secondary-outline': css`
    background: transparent;
    color: ${theme.colors.secondary};
    border-color: ${theme.colors.secondary};
  `,
  'ghost-outline': css`
    background: transparent;
    color: ${theme.colors.text};
    border-color: ${theme.colors.border};
  `,
  'danger-outline': css`
    background: transparent;
    color: ${theme.colors.error};
    border-color: ${theme.colors.error};
  `,
})

export const StyledButton = styled.button<IButtonStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 5px;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  /* Sizes */
  ${({ $size }) => sizeStyles[$size]}

  /* Variants */
  ${({ $variant, theme }) => variantStyles(theme)[$variant]}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  }

  &:hover {
    filter: brightness(0.9);
  }
`
