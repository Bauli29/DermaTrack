'use client'
import styled, { css } from 'styled-components'

import type { IStyledTextProps, TTextSize } from './types'

// Local, component-scoped typography tokens for Text variants (small/medium/large).
// Per project preference, these live with the component instead of the global theme.
// This keeps the atom portable and avoids cross-component coupling.
interface ITextToken {
  fontSize: string
  lineHeight: number
  spacingAfter: string
  fontWeight: number
}

const TEXT_TOKENS: { [S in TTextSize]: ITextToken } = {
  small: {
    fontSize: '0.875rem', // ~14px
    lineHeight: 1.5,
    spacingAfter: '1.31rem', // equal to line height for clear separation (~0.875 * 1.5)
    fontWeight: 400,
  },
  medium: {
    fontSize: '1rem', // ~16px (WCAG recommended minimum)
    lineHeight: 1.6,
    spacingAfter: '1.6rem', // equal to line height
    fontWeight: 400,
  },
  large: {
    fontSize: '1.125rem', // ~18px
    lineHeight: 1.6,
    spacingAfter: '1.8rem', // equal to line height
    fontWeight: 400,
  },
}

// Base typography rules per size
const sizeStyles = (size: TTextSize, weight?: number) => css`
  font-size: ${TEXT_TOKENS[size].fontSize};
  line-height: ${TEXT_TOKENS[size].lineHeight};
  font-weight: ${weight ?? TEXT_TOKENS[size].fontWeight};
`

// Optional responsive step-ups for larger viewports (mobile-first)
// Keeping the app mobile-oriented: use the token size on small screens,
// then apply a subtle bump on wider screens for readability.
const responsiveStyles = (size: TTextSize) => css`
  @media (min-width: 480px) {
    font-size: calc(${TEXT_TOKENS[size].fontSize} + 0.025rem);
  }
  @media (min-width: 768px) {
    font-size: calc(${TEXT_TOKENS[size].fontSize} + 0.05rem);
  }
`

// Wrapping and truncation logic
const wrappingStyles = (
  truncate?: boolean,
  noWrap?: boolean,
  maxLines?: number
) => {
  if (typeof maxLines === 'number' && maxLines > 0) {
    return css`
      display: -webkit-box;
      -webkit-line-clamp: ${maxLines};
      -webkit-box-orient: vertical;
      overflow: hidden;
    `
  }
  if (truncate) {
    return css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `
  }
  if (noWrap) {
    return css`
      white-space: nowrap;
    `
  }
  return css``
}

export const StyledText = styled.p<IStyledTextProps>`
  /* 1) Color from theme palette */
  color: ${({ theme, $color }) => theme.colors[$color]};

  /* 2) Typography from local tokens (with optional override) */
  ${({ $size, $weight }) => sizeStyles($size, $weight)}

  /* 3) Alignment */
  text-align: ${({ $align }) => $align};

  /* 4) Spacing behavior */
  ${({ $size, $noSpacing, $margin }) =>
    $margin
      ? css`
          margin: ${$margin};
        `
      : css`
          margin: 0 0 ${$noSpacing ? '0' : TEXT_TOKENS[$size].spacingAfter} 0;
        `}

  /* 5) Optional responsive sizing */
  ${({ $responsive, $size }) => $responsive && responsiveStyles($size)}

  /* 6) Wrapping / ellipsis */
  ${({ $truncate, $noWrap, $maxLines }) =>
    wrappingStyles($truncate, $noWrap, $maxLines)}

  /* 7) Subtle readability tweaks */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`
