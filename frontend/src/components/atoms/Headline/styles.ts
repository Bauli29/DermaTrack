'use client'
import styled, { css } from 'styled-components'

import type { IStyledHeadlineProps, THeadlineVariant } from './types'

// Local, component-scoped typography tokens for Headline variants (h1–h6).
// Moved from the theme into the component per project preference.
// Keeping these centralized here still provides a single source of truth for
// this atom, while avoiding global theme coupling.

interface IHeadlineToken {
  fontSize: string
  lineHeight: number
  spacingAfter: string
  fontWeight: number
}

const HEADLINE_TOKENS: { [V in THeadlineVariant]: IHeadlineToken } = {
  h1: {
    fontSize: '2.2rem', // ~35px
    lineHeight: 1.3,
    spacingAfter: '3rem', // 2.2 × 1.3
    fontWeight: 700,
  },
  h2: {
    fontSize: '1.9rem', // ~30px
    lineHeight: 1.35,
    spacingAfter: '2.565rem', // 1.9 × 1.35
    fontWeight: 700,
  },
  h3: {
    fontSize: '1.6rem', // ~26px
    lineHeight: 1.4,
    spacingAfter: '2.24rem', // 1.6 × 1.4
    fontWeight: 600,
  },
  h4: {
    fontSize: '1.4rem', // ~22px
    lineHeight: 1.45,
    spacingAfter: '2rem', // 1.4 × 1.45
    fontWeight: 600,
  },
  h5: {
    fontSize: '1.2rem', // ~19px
    lineHeight: 1.5,
    spacingAfter: '1.8rem', // 1.2 × 1.5
    fontWeight: 600,
  },
  h6: {
    fontSize: '1rem', // ~16px
    lineHeight: 1.5, // 1 × 1.5
    spacingAfter: '1.5rem', // 1.5 × 1
    fontWeight: 600,
  },
}

// Helper to map variant -> CSS using local tokens
const variantStyles = (variant: THeadlineVariant) => css`
  font-size: ${HEADLINE_TOKENS[variant].fontSize};
  line-height: ${HEADLINE_TOKENS[variant].lineHeight};
  font-weight: ${HEADLINE_TOKENS[variant].fontWeight};
`

export const StyledHeadline = styled.h1<IStyledHeadlineProps>`
  /* 1) Color from theme palette */
  color: ${({ theme, $color }) => theme.colors[$color]};

  /* 2) Typography from local tokens */
  ${({ $variant }) => variantStyles($variant)}

  /* 3) Alignment */
  text-align: ${({ $align }) => $align};

  /* 4) Spacing behavior */
  ${({ $variant, $noSpacing, $margin }) =>
    $margin
      ? css`
          margin: ${$margin};
        `
      : css`
          margin: 0 0
            ${$noSpacing ? '0' : HEADLINE_TOKENS[$variant].spacingAfter} 0;
        `}

  /* 5) Utility/UX tweaks */
  user-select: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`
