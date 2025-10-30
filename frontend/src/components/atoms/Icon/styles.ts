// /Users/proettgen/dev/DHBW/DermaTrack/frontend/src/components/atoms/icon/styles.ts

'use client'
import styled, { css } from 'styled-components'

import { ITheme } from '@/lib/themes'

import { IStyledIconProps } from './types'

const sizeStyles = {
  sm: css`
    font-size: 20px;
    width: 20px;
    height: 20px;
  `,
  md: css`
    font-size: 24px;
    width: 24px;
    height: 24px;
  `,
  lg: css`
    font-size: 28px;
    width: 28px;
    height: 28px;
  `,
}

const colorStyles = (theme: ITheme) => ({
  primary: css`
    color: ${theme.colors.primary};
  `,
  secondary: css`
    color: ${theme.colors.secondary};
  `,
  error: css`
    color: ${theme.colors.error};
  `,
  warning: css`
    color: ${theme.colors.warning};
  `,
  info: css`
    color: ${theme.colors.info};
  `,
  success: css`
    color: ${theme.colors.success};
  `,
})

export const Icon = styled.span<IStyledIconProps>`
  font-family: 'Material Symbols Outlined';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  user-select: none;
  vertical-align: middle;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  ${({ $spacing }) => $spacing && `margin: ${$spacing};`}

  /* Sizes */
  ${({ $size }) => sizeStyles[$size]}
  
  /* Colors */
  ${({ $color, theme }) => colorStyles(theme)[$color]}
  
  /* Hover effect for clickable icons */
  ${({ $clickable }) =>
    $clickable &&
    css`
      &:hover {
        filter: brightness(0.85);
      }
    `}
`
