import { TextareaHTMLAttributes } from 'react'

export type TValidationState = 'none' | 'success' | 'error'

export interface ITextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'color'> {
  /**
   * Optional label shown above the text area. If provided, it will render using the Headline atom.
   */
  label?: string
  /**
   * Visual variant of the label (h1..h6). Default: 'h4' for good mobile readability without being too large.
   */
  labelVariant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * Validation state of the field. Controls outline color and status icon on the right.
   * - 'none': default neutral state
   * - 'success': green outline + check icon
   * - 'error': red outline + x icon
   */
  validation?: TValidationState
  /**
   * Optional helper text shown below the text area (e.g., validation hint or character count info).
   */
  helperText?: string
  /**
   * Occupy full available width if true. Defaults to true for mobile-first layouts.
   */
  fullWidth?: boolean
  /**
   * Custom CSS margin string for the whole component block (container).
   */
  margin?: string
  /**
   * Max visual width (e.g., '100%', '320px'). Useful inside forms.
   */
  maxWidth?: string
}

export interface IStyledContainerProps {
  $fullWidth: boolean
  $margin?: string
  $maxWidth?: string
}

export interface IStyledTextAreaProps {
  $hasLabel: boolean
  $validation: TValidationState
  $disabled?: boolean
}

export interface IStatusIconProps {
  $visible: boolean
}
