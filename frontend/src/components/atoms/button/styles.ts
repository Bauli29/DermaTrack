'use client'
import styled, { css } from 'styled-components'

import { ITheme } from '@/lib/themes'

import { IButtonStyleProps } from './types'

const sizeStyles = {
  sm: css`
    height: 2rem; // 32px
    padding: 0 0.75rem; // 12px
    font-size: 0.875rem; // 14px
  `,
  md: css`
    height: 2.5rem; // 40px
    padding: 0 1rem; // 16px
    font-size: 1rem; // 16px (WCAG minimum)
  `,
  lg: css`
    height: 3rem; // 48px
    padding: 0 1.25rem; // 20px
    font-size: 1.125rem; // 18px
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
  gap: 0.5rem; // 8px
  border-radius: 0.3125rem; // 5px
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  line-height: 1.5;

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
    filter: brightness(0.85);
  }
`
