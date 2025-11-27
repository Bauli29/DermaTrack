'use client'

import { useId } from 'react'

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
  const showSuccess = validation === 'success'
  const showError = validation === 'error'

  return (
    <SC.Container $fullWidth={fullWidth} $margin={margin} $maxWidth={maxWidth}>
      {label && (
        <Text size='small' color='text' style={{ marginBottom: '0.375rem' }}>
          {label}
        </Text>
      )}

      <SC.FieldWrapper>
        <SC.Input
          id={fieldId}
          type={type}
          $validation={validation}
          $disabled={disabled}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={showError}
          aria-describedby={helperId}
          {...rest}
        />

        <SC.StatusIcon $visible={showSuccess || showError} aria-hidden>
          {showSuccess && (
            <Icon name='check_circle' color='success' size='md' />
          )}
          {showError && <Icon name='cancel' color='error' size='md' />}
        </SC.StatusIcon>
      </SC.FieldWrapper>

      {helperText && (
        <Text
          id={helperId}
          size='small'
          color={showError ? 'error' : 'textMuted'}
          style={{ marginTop: '0.5rem' }}
        >
          {helperText}
        </Text>
      )}
    </SC.Container>
  )
}

export default Input
