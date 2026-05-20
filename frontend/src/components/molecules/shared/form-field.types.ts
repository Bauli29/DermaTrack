export type TValidationState = 'none' | 'success' | 'error'

export interface IStyledContainerProps {
  $fullWidth: boolean
  $margin?: string
  $maxWidth?: string
}

export interface IStatusIconProps {
  $visible: boolean
}

export interface IStyledValidationFieldProps {
  $validation: TValidationState
  $disabled?: boolean
}
