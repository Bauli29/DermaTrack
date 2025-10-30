import * as SC from './styles'
import { IIconProps } from './types'

const Icon = ({
  name,
  color = 'primary',
  size = 'md',
  spacing,
  onClick,
  ...props
}: IIconProps) => (
  <SC.Icon
    $color={color}
    $size={size}
    $spacing={spacing}
    $clickable={!!onClick}
    onClick={onClick}
    {...props}
  >
    {name}
  </SC.Icon>
)

export default Icon
