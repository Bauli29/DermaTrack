import { TextareaHTMLAttributes } from 'react'

import type { TValidationState } from '../shared/form-field.types'

export type {
  IStatusIconProps,
  IStyledContainerProps,
  TValidationState,
} from '../shared/form-field.types'

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

export interface IStyledTextAreaProps {
  $validation: TValidationState
  $disabled?: boolean
}
