import type { TButtonVariant } from '@/components/atoms/Button/types'
import type { TIconColor, TIconSize } from '@/components/atoms/Icon/types'
import type { TLinkVariant } from '@/components/atoms/Link/types'

export interface IButtonExample {
  label: string
  variant: TButtonVariant
  clickable?: boolean
}

export interface IIconExample {
  name: string
  size: TIconSize
  color: TIconColor
  ariaLabel?: string
}

export interface ILinkExample {
  href: string
  label: string
  variant?: TLinkVariant
  showExternalIcon?: boolean
  underline?: boolean
  disabled?: boolean
}
