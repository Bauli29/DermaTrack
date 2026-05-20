import { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react'

import type { TValidationState } from '../shared/form-field.types'

export interface ICompoundCheckboxDetailInput {
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

export interface ICompoundCheckboxOption {
  value: string
  label: string
  helperText?: string
  detailInput?: ICompoundCheckboxDetailInput
}

export interface ICompoundCheckboxesProps {
  name: string
  options: readonly ICompoundCheckboxOption[]
  values?: string[]
  onChange: (values: string[]) => void
  legend?: string
  helperText?: string
  margin?: string
  disabled?: boolean
}

export interface IStyledCompoundCheckboxesProps {
  $margin?: string
}
