import { SelectHTMLAttributes } from 'react'

export interface ISelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ISelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'size'
> {
  options: readonly ISelectOption[]
  placeholder?: string
  fullWidth?: boolean
  width?: string
  maxWidth?: string
  margin?: string
}

export interface IStyledSelectWrapperProps {
  $fullWidth: boolean
  $width?: string
  $maxWidth?: string
  $margin?: string
}

export interface IStyledSelectProps {
  $disabled?: boolean
}
