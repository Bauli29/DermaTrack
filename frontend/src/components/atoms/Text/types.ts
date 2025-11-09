import { HTMLAttributes, JSX } from 'react'
import type { ITheme } from '@/lib/themes'

export type TTextSize = 'small' | 'medium' | 'large'

export type TTextColor = keyof ITheme['colors']

export type TTextAlign = 'left' | 'center' | 'right' | 'justify'

export interface ITextProps extends HTMLAttributes<HTMLParagraphElement> {
  // Visual size of the text, mapped to local typography tokens
  size?: TTextSize
  // Color key from the theme palette (e.g., 'text', 'textSecondary', 'primary')
  color?: TTextColor
  // Text alignment
  align?: TTextAlign
  // Optional font-weight override (defaults to token weight)
  weight?: number
  // Remove default bottom spacing defined by tokens
  noSpacing?: boolean
  // Custom CSS margin string (overrides spacing logic if provided)
  margin?: string
  // Single-line truncation with ellipsis
  truncate?: boolean
  // Multi-line clamp (overrides single-line truncate when provided)
  maxLines?: number
  // Prevent wrapping (no ellipsis by default). If combined with truncate, truncate wins.
  noWrap?: boolean
  // Enable responsive font-size step-ups (mobile-first)
  responsive?: boolean
  // Semantic tag override (defaults to 'p')
  as?: keyof JSX.IntrinsicElements
}

export interface IStyledTextProps {
  $size: TTextSize
  $color: TTextColor
  $align: TTextAlign
  $noSpacing?: boolean
  $margin?: string
  $responsive?: boolean
  $truncate?: boolean
  $noWrap?: boolean
  $maxLines?: number
  $weight?: number
}
