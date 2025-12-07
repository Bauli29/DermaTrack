import { TextareaHTMLAttributes } from 'react'

export type TValidationState = 'none' | 'success' | 'error'

export interface ITextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'color'
> {
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

export interface IStyledTextAreaProps {
  $validation: TValidationState
  $disabled?: boolean
}

export interface IStatusIconProps {
  $visible: boolean
}
