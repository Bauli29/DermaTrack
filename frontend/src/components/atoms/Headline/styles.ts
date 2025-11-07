'use client'
import styled, { css } from 'styled-components'

import type { ITheme } from '@/lib/themes'

import type { IStyledHeadlineProps, THeadlineVariant } from './types'

const variantStyles = (theme: ITheme, variant: THeadlineVariant) => css`
  font-size: ${theme.typography.headings[variant].fontSize};
  line-height: ${theme.typography.headings[variant].lineHeight};
  font-weight: ${theme.typography.headings[variant].fontWeight};
`

export const StyledHeadline = styled.h1<IStyledHeadlineProps>`
  color: ${({ theme, $color }) => theme.colors[$color]};

  ${({ theme, $variant }) => variantStyles(theme, $variant)}

  text-align: ${({ $align }) => $align};

  ${({ theme, $variant, $noSpacing, $margin }) =>
    $margin
      ? css`
          margin: ${$margin};
        `
      : css`
          margin: 0 0
            ${$noSpacing
              ? '0'
              : theme.typography.headings[$variant].spacingAfter}
            0;
        `}

  user-select: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`
