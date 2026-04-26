'use client'

import { useId } from 'react'

import Text from '@/components/atoms/Text'

import * as SC from './styles'

import type { IRadioProps } from './types'

const Radio = ({
  label,
  checked = false,
  disabled = false,
  id,
  ...rest
}: IRadioProps) => {
  const reactId = useId()
  const fieldId = id ?? `radio-${reactId}`

  return (
    <SC.Label $disabled={disabled} htmlFor={fieldId}>
      <SC.HiddenInput
        id={fieldId}
        type='radio'
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <SC.Indicator $checked={checked} $disabled={disabled} aria-hidden />
      <Text
        as='span'
        size='medium'
        color={disabled ? 'textMuted' : 'text'}
        noSpacing
      >
        {label}
      </Text>
    </SC.Label>
  )
}

export default Radio
