'use client'
import styled from 'styled-components'

export const Root = styled.div`
  position: relative;
  width: 100%;

  /*noinspection CssUnusedSymbol*/
  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    width: 100%;
  }

  /*noinspection CssUnusedSymbol*/
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

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__input.is-invalid {
    border-color: ${({ theme }) => theme.colors.error};
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__input:focus {
    border-color: ${({ theme }) => theme.colors.active};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus}33;
    outline: none;
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__popper {
    z-index: 20;
    inset-inline-start: 0 !important;
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar.react-datepicker {
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    box-shadow: 0 10px 24px ${({ theme }) => theme.colors.shadow};
    overflow: hidden;
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar .react-datepicker__header {
    background: ${({ theme }) => theme.colors.card};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar .react-datepicker__header--custom {
    padding: 0;
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar .react-datepicker__current-month {
    color: ${({ theme }) => theme.colors.text};
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar .react-datepicker__day-name,
  .date-calendar-picker__calendar .react-datepicker__day {
    color: ${({ theme }) => theme.colors.text};
    width: 2.2rem;
    line-height: 2.2rem;
    margin: 0.1rem;
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar .react-datepicker__day:hover {
    background: #dbeafe;
    border-radius: 8px;
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar .react-datepicker__day--selected,
  .date-calendar-picker__calendar .react-datepicker__day--keyboard-selected {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    border-radius: 8px;
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar .react-datepicker__day--today {
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
  }

  /*noinspection CssUnusedSymbol*/
  .date-calendar-picker__calendar .react-datepicker__day--disabled {
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.45;
  }
`

export const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 32px;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 6px;
`

export const CalendarNavigationButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    background: #dbeafe;
  }

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.active};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus}33;
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`

export const CalendarCurrentMonth = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`
