'use client'

import React, { forwardRef } from 'react'

import * as SC from './styles'
import { IButtonProps } from './types'

const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      startIcon,
      endIcon,
      children,
    },
    ref
  ) => {
    const isDisabled = disabled ?? loading

    return (
      <SC.StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading || undefined}
        data-disabled={isDisabled}
      >
        {loading ? (
          <SC.Spinner $size={size} $variant={variant} aria-hidden='true' />
        ) : (
          <SC.ButtonLabel>
            {startIcon}
            <span>{children}</span>
            {endIcon}
          </SC.ButtonLabel>
        )}
      </SC.StyledButton>
    )
  }
)

Button.displayName = 'Button'

export default Button
