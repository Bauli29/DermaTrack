import * as SC from './styles'
import type { ITextProps } from './types'

/**
 * Text atom
 * - Mobile-first body text that follows local typography tokens
 * - Color is taken from the theme palette via the `color` prop (defaults to theme.colors.text)
 * - Supports alignment, spacing control, and responsive step-ups
 * - Provides truncation utilities: single-line ellipsis, nowrap, and multi-line clamp
 */
const Text = ({
  size = 'medium',
  color = 'text',
  align = 'left',
  weight,
  noSpacing = false,
  margin,
  truncate = false,
  maxLines,
  noWrap = false,
  responsive = true,
  as = 'p',
  children,
  ...rest
}: ITextProps) => (
  <SC.StyledText
    as={as}
    $size={size}
    $color={color}
    $align={align}
    $weight={weight}
    $noSpacing={noSpacing}
    $margin={margin}
    $truncate={truncate}
    $maxLines={maxLines}
    $noWrap={noWrap}
    $responsive={responsive}
    {...rest}
  >
    {children}
  </SC.StyledText>
)

export default Text
