import { InputHTMLAttributes, ReactNode } from 'react'

export interface IRadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'type'
> {
  label: ReactNode
}

export interface IStyledRadioLabelProps {
  $disabled?: boolean
}

export interface IStyledRadioIndicatorProps {
  $checked: boolean
  $disabled?: boolean
}
