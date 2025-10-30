import { HTMLAttributes } from 'react'

export type TIconColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'

export type TIconSize = 'sm' | 'md' | 'lg'

export interface IIconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string
  color?: TIconColor
  size?: TIconSize
  spacing?: string
  onClick?: () => void
}

export interface IStyledIconProps {
  $color: TIconColor
  $size: TIconSize
  $spacing?: string
  $clickable: boolean
}
