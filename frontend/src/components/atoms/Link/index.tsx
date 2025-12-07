import Icon from '@/components/atoms/Icon'

import * as SC from './styles'
import { ILinkProps } from './types'

const Link = ({
  href,
  variant = 'default',
  showExternalIcon = false,
  underline = false,
  disabled = false,
  children,
  ...props
}: ILinkProps) => {
  // Determine if link is external
  const isExternal = href.startsWith('http://') || href.startsWith('https://')

  const commonProps = {
    $variant: variant,
    $isExternal: isExternal,
    $underline: underline,
    $disabled: disabled,
  }

  // External link
  if (isExternal) {
    return (
      <SC.ExternalLinkWrapper
        href={disabled ? undefined : href}
        target='_blank'
        rel='noopener noreferrer'
        aria-disabled={disabled}
        {...commonProps}
        {...props}
      >
        {children}
        {showExternalIcon && (
          <SC.ExternalIcon aria-hidden='true'>
            <Icon name='open_in_new' size='sm' style={{ color: 'inherit' }} />
          </SC.ExternalIcon>
        )}
      </SC.ExternalLinkWrapper>
    )
  }

  // Internal link
  return (
    <SC.StyledLink
      href={disabled ? '#' : href}
      aria-disabled={disabled}
      {...commonProps}
      {...props}
      onClick={disabled ? e => e.preventDefault() : props.onClick}
    >
      {children}
    </SC.StyledLink>
  )
}

export default Link
