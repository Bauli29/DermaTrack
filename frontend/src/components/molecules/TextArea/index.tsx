'use client'

import { useId } from 'react'

import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import * as SC from './styles'

import type { ITextAreaProps } from './types'

/**
 * Multi-line text input with label, validation states, and status icons.
 */
const TextArea = ({
  label,
  validation = 'none',
  helperText,
  fullWidth = true,
  margin,
  maxWidth,
  disabled,
  id,
  placeholder,
  rows = 4,
  ...rest
}: ITextAreaProps) => {
  const reactId = useId()
  const fieldId = id ?? `textarea-${reactId}`
  const helperId = helperText ? `${fieldId}-helper` : undefined
  const showSuccess = validation === 'success'
  const showError = validation === 'error'

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
        <SC.TextArea
          id={fieldId}
          $validation={validation}
          $disabled={disabled}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
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
          margin='0.5rem 0 0 0'
        >
          {helperText}
        </Text>
      )}
    </SC.Container>
  )
}

export default TextArea
