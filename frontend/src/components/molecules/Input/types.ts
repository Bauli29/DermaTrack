import { InputHTMLAttributes } from 'react'

export type TValidationState = 'none' | 'success' | 'error'

export interface IInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'color'> {
  label?: string
  validation?: TValidationState
  helperText?: string
  fullWidth?: boolean
  margin?: string
  maxWidth?: string
}

export interface IStyledContainerProps {
  $fullWidth: boolean
  $margin?: string
  $maxWidth?: string
}

export interface IStyledInputProps {
  $validation: TValidationState
  $disabled?: boolean
}

export interface IStatusIconProps {
  $visible: boolean
}
