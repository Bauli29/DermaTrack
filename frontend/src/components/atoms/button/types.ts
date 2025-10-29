import { ButtonHTMLAttributes } from 'react'

export type TButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost-outline'
  | 'ghost'
  | 'danger'
  | 'primary-outline'
  | 'secondary-outline'
  | 'danger-outline'

export type TButtonSize = 'sm' | 'md' | 'lg'

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant
  size?: TButtonSize
  fullWidth?: boolean
  disabled?: boolean
}

export interface IButtonStyleProps {
  $variant: TButtonVariant
  $size: TButtonSize
  $fullWidth?: boolean
}
