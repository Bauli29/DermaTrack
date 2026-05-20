import { InputHTMLAttributes } from 'react'

import type { TValidationState } from '../shared/form-field.types'

export type {
  IStatusIconProps,
  IStyledContainerProps,
  TValidationState,
} from '../shared/form-field.types'

export interface IInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'color'
> {
  label?: string
  validation?: TValidationState
  helperText?: string
  fullWidth?: boolean
  margin?: string
  maxWidth?: string
}

export interface IStyledInputProps {
  $validation: TValidationState
  $disabled?: boolean
}
