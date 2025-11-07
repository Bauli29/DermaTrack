import { HTMLAttributes } from 'react'
import type { ITheme } from '@/lib/themes'

export type THeadlineVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type THeadlineColor = keyof ITheme['colors']

export type THeadlineAlign = 'left' | 'center' | 'right'

export interface IHeadlineProps extends HTMLAttributes<HTMLHeadingElement> {
  variant?: THeadlineVariant
  color?: THeadlineColor
  align?: THeadlineAlign
  // If true, removes the default bottom spacing from the theme (useful when stacking tightly)
  noSpacing?: boolean
  // Optional full CSS margin override (e.g., "0 0 1rem 0"). If provided, it wins over spacing.
  margin?: string
  // Optional semantic override. If omitted, we render the same tag as the variant.
  as?: THeadlineVariant
}

export interface IStyledHeadlineProps {
  $variant: THeadlineVariant
  $color: THeadlineColor
  $align: THeadlineAlign
  $noSpacing?: boolean
  $margin?: string
}
