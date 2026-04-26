'use client'

import Icon from '@/components/atoms/Icon'

import * as SC from './styles'

import type { ISelectProps } from './types'

const Select = ({
  options,
  placeholder,
  fullWidth = true,
  width,
  maxWidth,
  margin,
  disabled = false,
  value,
  defaultValue,
  ...rest
}: ISelectProps) => {
  const hasPlaceholder =
    typeof placeholder === 'string' && placeholder.length > 0
  const placeholderValue = ''
  const resolvedDefaultValue =
    hasPlaceholder && value === undefined && defaultValue === undefined
      ? placeholderValue
      : defaultValue

  return (
    <SC.Wrapper
      $fullWidth={fullWidth}
      $width={width}
      $maxWidth={maxWidth}
      $margin={margin}
    >
      <SC.Select
        disabled={disabled}
        $disabled={disabled}
        value={value}
        defaultValue={resolvedDefaultValue}
        {...rest}
      >
        {hasPlaceholder && (
          <option value={placeholderValue} disabled>
            {placeholder}
          </option>
        )}

        {options.map(option => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </SC.Select>

      <SC.Indicator aria-hidden>
        <Icon name='expand_more' color='textSecondary' size='md' />
      </SC.Indicator>
    </SC.Wrapper>
  )
}

export default Select
