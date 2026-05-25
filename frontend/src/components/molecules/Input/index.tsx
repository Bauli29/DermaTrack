'use client'

import { useId, useEffect, useRef, useState } from 'react'

import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import * as SC from './styles'

import type { IInputProps } from './types'

/**
 * Input field with label, validation states, and status icons.
 */
const Input = ({
  label,
  validation = 'none',
  helperText,
  fullWidth = true,
  margin,
  maxWidth,
  disabled,
  id,
  placeholder,
  type = 'text',
  ...rest
}: IInputProps) => {
  const reactId = useId()
  const fieldId = id ?? `input-${reactId}`
  const helperId = helperText ? `${fieldId}-helper` : undefined
  const showError = validation === 'error'
  const [showPassword, setShowPassword] = useState(false)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    },
    []
  )

  const handleTogglePassword = () => {
    if (!showPassword) {
      setShowPassword(true)
      hideTimerRef.current = window.setTimeout(() => {
        setShowPassword(false)
        hideTimerRef.current = null
      }, 3000)
    } else {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      setShowPassword(false)
    }
  }

  return (
    <SC.Container $fullWidth={fullWidth} $margin={margin} $maxWidth={maxWidth}>
      {label && (
        <Text
          as='label'
          htmlFor={fieldId}
          size='small'
          color='text'
          margin='0 0 0.375rem 0'
        >
          {label}
        </Text>
      )}

      <SC.FieldWrapper>
        <SC.Input
          id={fieldId}
          type={type === 'password' && showPassword ? 'text' : type}
          $validation={validation}
          $disabled={disabled}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={showError}
          aria-describedby={helperId}
          {...rest}
        />
        {type === 'password' && (
          <SC.ToggleButton
            type='button'
            onClick={handleTogglePassword}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon
              name={showPassword ? 'visibility_off' : 'visibility'}
              size='md'
            />
          </SC.ToggleButton>
        )}

        <SC.StatusIcon $visible={showError} aria-hidden>
          {showError && <Icon name='cancel' color='error' size='md' />}
        </SC.StatusIcon>
      </SC.FieldWrapper>

      {helperText && (
        <Text
          id={helperId}
          size='small'
          color={showError ? 'error' : 'textMuted'}
          margin='0.5rem 0 0 0'
        >
          {helperText}
        </Text>
      )}
    </SC.Container>
  )
}

export default Input
