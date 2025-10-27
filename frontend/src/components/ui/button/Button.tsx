'use client'
import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { ButtonLabel, Spinner, StyledButton } from './styles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  // Allow polymorphic rendering for Links etc.
  as?: any
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading || undefined}
        data-disabled={isDisabled}
        {...rest}
      >
        {loading ? (
          <Spinner $size={size} $variant={variant} aria-hidden="true" />
        ) : (
          <ButtonLabel>
            {startIcon}
            <span>{children}</span>
            {endIcon}
          </ButtonLabel>
        )}
      </StyledButton>
    )
  }
)

Button.displayName = 'Button'

export default Button
