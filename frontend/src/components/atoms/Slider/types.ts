import { HTMLAttributes } from 'react'

export type TSliderVariant = 'primary' | 'secondary'

export interface ISliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number
  color?: TSliderVariant
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  // Wrapper Props
  width?: string
  maxWidth?: string
  margin?: string
}
// Wrapper
export interface IStyledSliderWrapperProps {
  $width?: string
  $maxWidth?: string
  $margin?: string
}
// Track (Bar)
export interface IStyledSliderTrackProps {
  $color: TSliderVariant
  $disabled: boolean
}
// Point to move up to the Value
export interface IStyledSliderThumbProps {
  $color: TSliderVariant
  $disabled: boolean
  $percentage: number // for calculating the value
  $isDragging: boolean
}
// Fill the Bar up to the Value
export interface IStyledSliderFillProps {
  $color: TSliderVariant
  $percentage: number // filling the Track until the Point of Thumb
  $disabled: boolean
}
