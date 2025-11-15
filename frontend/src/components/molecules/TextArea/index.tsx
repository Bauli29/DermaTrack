'use client'

import { useId } from 'react'

import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import * as SC from './styles'
import type { ITextAreaProps } from './types'

/**
 * TextArea (Molecule)
 *
 * Why a molecule and not a pure atom?
 * - The app needs a multi-line input together with an optional headline/label,
 *   validation outline colors, and a status icon (✓ or ✕) on the right. This
 *   small composition of several atoms (Headline, Icon, Text) forms a reusable
 *   molecule that can be dropped into forms across the app.
 *
 * Mobile-first principles used here:
 * - Minimum readable font-size (16px) and generous line-height for touch.
 * - Comfortable padding and a clear focus ring for accessibility.
 * - Full-width by default to fit mobile form layouts.
 *
 * Theming:
 * - Colors (text, background, borders, focus ring, success/error) are taken
 *   from the styled-components theme via `theme.colors.*`.
 * - Typography uses the app's inherited font family and size.
 */
const TextArea = ({
  label,
  labelVariant = 'h4',
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
  // Generate stable IDs for accessibility if not provided by consumer
  const reactId = useId()
  const fieldId = id ?? `textarea-${reactId}`
  const helperId = helperText ? `${fieldId}-helper` : undefined

  // Determine validation icon and visibility
  const showSuccess = validation === 'success'
  const showError = validation === 'error'

  return (
    <SC.Container $fullWidth={fullWidth} $margin={margin} $maxWidth={maxWidth}>
      {label && (
        // Use Headline atom as a visually consistent label above the field.
        // We keep it simple here rather than a <label> element. For screen
        // readers, we still connect via aria-labelledby if needed in future.
        <Headline
          variant={labelVariant}
          noSpacing
          style={{ marginBottom: '0.5rem' }}
        >
          {label}
        </Headline>
      )}

      <SC.FieldWrapper>
        <SC.StyledTextArea
          id={fieldId}
          $hasLabel={!!label}
          $validation={validation}
          $disabled={disabled}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          aria-invalid={showError}
          aria-describedby={helperId}
          {...rest}
        />

        {/* Status icon on the right; purely decorative visual feedback */}
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

export default TextArea
