export interface IDateCalendarPickerProps {
  value: string
  maxDate: string
  onChange: (nextValue: string) => void
  ariaInvalid?: boolean
  ariaDescribedBy?: string
}
