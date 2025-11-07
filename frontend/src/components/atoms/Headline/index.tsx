import * as SC from './styles'
import type { IHeadlineProps } from './types'

/**
 * Props overview (see types.ts for full typing):
 * - variant: visual size/weight (h1..h6). Default is h2 (good mobile baseline).
 * - color: any color key from theme.colors (e.g., 'text', 'primary'). Defaults to 'text'.
 * - align: 'left' | 'center' | 'right'. Defaults to 'left'.
 * - noSpacing: removes default bottom spacing (good for tight stacks).
 * - margin: full CSS margin override string. If provided, it overrides spacing logic.
 * - as: optional semantic tag override (e.g., render visually an h4 but as <h1/>).
 */
const Headline = ({
  variant = 'h2',
  color = 'text',
  align = 'left',
  noSpacing = false,
  margin,
  as,
  children,
  ...rest
}: IHeadlineProps) => (
  <SC.StyledHeadline
    as={as ?? variant}
    $variant={variant}
    $color={color}
    $align={align}
    $noSpacing={noSpacing}
    $margin={margin}
    {...rest}
  >
    {children}
  </SC.StyledHeadline>
)

export default Headline
