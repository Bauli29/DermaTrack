'use client'
import styled from 'styled-components'

export const Root = styled.div`
  position: relative;
  width: 100%;

  .date-calendar-picker__input {
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.card};
    color: ${({ theme }) => theme.colors.text};
    font-size: 16px;
  }

  .date-calendar-picker__input.is-invalid {
    border-color: ${({ theme }) => theme.colors.error};
  }

  .date-calendar-picker__input:focus {
    border-color: ${({ theme }) => theme.colors.active};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus}33;
    outline: none;
  }

  .date-calendar-picker__popper {
    z-index: 20;
    inset-inline-start: 0 !important;
  }

  .date-calendar-picker__calendar.react-datepicker {
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    box-shadow: 0 10px 24px ${({ theme }) => theme.colors.shadow};
    overflow: hidden;
  }

  .date-calendar-picker__calendar .react-datepicker__header {
    background: ${({ theme }) => theme.colors.card};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  }

  .date-calendar-picker__calendar .react-datepicker__current-month {
    color: ${({ theme }) => theme.colors.text};
  }

  .date-calendar-picker__calendar .react-datepicker__day-name,
  .date-calendar-picker__calendar .react-datepicker__day {
    color: ${({ theme }) => theme.colors.text};
    width: 2.2rem;
    line-height: 2.2rem;
    margin: 0.1rem;
  }

  .date-calendar-picker__calendar .react-datepicker__day:hover {
    background: #dbeafe;
    border-radius: 8px;
  }

  .date-calendar-picker__calendar .react-datepicker__day--selected,
  .date-calendar-picker__calendar .react-datepicker__day--keyboard-selected {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    border-radius: 8px;
  }

  .date-calendar-picker__calendar .react-datepicker__day--today {
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
  }

  .date-calendar-picker__calendar .react-datepicker__day--disabled {
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.45;
  }
`
