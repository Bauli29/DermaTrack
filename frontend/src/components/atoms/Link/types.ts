import { AnchorHTMLAttributes, ReactNode } from 'react'

export type TLinkVariant = 'default' | 'primary' | 'secondary' | 'muted'

export interface ILinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  variant?: TLinkVariant
  showExternalIcon?: boolean
  underline?: boolean
  disabled?: boolean
  children: ReactNode
}

export interface IStyledLinkProps {
  $variant: TLinkVariant
  $isExternal: boolean
  $underline: boolean
  $disabled: boolean
}
