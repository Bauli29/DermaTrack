import * as SC from './styles'
import { IButtonProps } from './types'

const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  children,
  ...props
}: IButtonProps) => (
  <SC.StyledButton
    $variant={variant}
    $size={size}
    $fullWidth={fullWidth}
    disabled={disabled}
    {...props}
  >
    {children}
  </SC.StyledButton>
)

export default Button
