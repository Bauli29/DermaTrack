'use client'

import { useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { formatDateInput } from '@/lib/date'

import * as SC from './styles'
import type { IDateCalendarPickerProps } from './types'

/*const parseDateInputValue = (value: string): Date | null => {
  const [yearText, monthText, dayText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null
  }

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const isSameDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  return isSameDate ? date : null
}*/

const parseDateInputValue = (value?: string | null): Date | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }

  const parts = value.split('-')
  if (parts.length !== 3) {
    return null
  }

  const [yearText, monthText, dayText] = parts

  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null
  }

  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const isSameDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  return isSameDate ? date : null
}

const DateCalendarPicker = ({
  value,
  maxDate,
  onChange,
  ariaInvalid,
  ariaDescribedBy,
}: IDateCalendarPickerProps) => {
  const selectedDate = useMemo(() => parseDateInputValue(value), [value])
  const maxSelectableDate = useMemo(
    () => parseDateInputValue(maxDate) ?? new Date(),
    [maxDate]
  )

  const onSelectDate = (nextDate: Date | null) => {
    if (!nextDate) {
      return
    }

    onChange(formatDateInput(nextDate))
  }

  return (
    <SC.Root>
      <DatePicker
        selected={selectedDate}
        onChange={onSelectDate}
        maxDate={maxSelectableDate}
        dateFormat='yyyy-MM-dd'
        placeholderText='yyyy-MM-dd'
        className={`date-calendar-picker__input${ariaInvalid ? ' is-invalid' : ''}`}
        calendarClassName='date-calendar-picker__calendar'
        popperClassName='date-calendar-picker__popper'
        popperPlacement='bottom-start'
        showPopperArrow={false}
        ariaInvalid={ariaInvalid ? 'true' : undefined}
        ariaDescribedBy={ariaDescribedBy}
      />
    </SC.Root>
  )
}

export default DateCalendarPicker
