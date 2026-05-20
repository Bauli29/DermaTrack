import { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react'

import type { TValidationState } from '../shared/form-field.types'

export interface ICompoundRadioDetailInput {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  validation?: TValidationState
  disabled?: boolean
  type?: HTMLInputTypeAttribute
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete']
  maxLength?: number
}

export interface ICompoundRadioOption {
  value: string
  label: string
  helperText?: string
  detailInput?: ICompoundRadioDetailInput
}

export interface ICompoundRadioButtonsProps {
  name: string
  options: readonly ICompoundRadioOption[]
  value?: string
  onChange: (value: string) => void
  legend?: string
  helperText?: string
  margin?: string
  disabled?: boolean
}

export interface IStyledCompoundRadioButtonsProps {
  $margin?: string
}
