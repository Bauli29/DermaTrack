'use client'
import styled from 'styled-components'

export const PageWrapper = styled.main`
  width: 100%;
  min-height: calc(100dvh - 128px);
  max-width: 1120px;
  margin: 0 auto;
  padding: 12px 12px 20px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 480px) {
    padding: 16px;
    gap: 16px;
  }

  @media (min-width: 900px) {
    padding: 20px 24px 24px;
  }
`

export const PageHeader = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 2px;
`

export const Toolbar = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const ToolbarActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
`

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

export const RangePickerRoot = styled.div`
  flex: 1;
  min-width: 200px;

  /*noinspection CssUnusedSymbol*/
  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    width: 100%;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__input {
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
  .stats-range-picker__input:focus {
    border-color: ${({ theme }) => theme.colors.active};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus}33;
    outline: none;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__popper {
    z-index: 20;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar.react-datepicker {
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    box-shadow: 0 10px 24px ${({ theme }) => theme.colors.shadow};
    overflow: hidden;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__header {
    background: ${({ theme }) => theme.colors.card};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__current-month,
  .stats-range-picker__calendar .react-datepicker__day-name {
    color: ${({ theme }) => theme.colors.text};
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day {
    color: ${({ theme }) => theme.colors.text};
    width: 2.2rem;
    line-height: 2.2rem;
    margin: 0.1rem;
    border-radius: 0;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day:hover {
    background: ${({ theme }) => theme.colors.primary}22;
    border-radius: 8px;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day--range-start,
  .stats-range-picker__calendar .react-datepicker__day--range-end,
  .stats-range-picker__calendar .react-datepicker__day--selected,
  .stats-range-picker__calendar .react-datepicker__day--keyboard-selected {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day--range-start {
    border-radius: 8px 0 0 8px;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day--range-end {
    border-radius: 0 8px 8px 0;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar
    .react-datepicker__day--range-start.react-datepicker__day--range-end {
    border-radius: 8px;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day--in-range {
    background: ${({ theme }) => theme.colors.primary}33;
    color: ${({ theme }) => theme.colors.text};
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day--in-selecting-range {
    background: ${({ theme }) => theme.colors.primary}22;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day--today {
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__day--disabled {
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.45;
  }

  /*noinspection CssUnusedSymbol*/
  .stats-range-picker__calendar .react-datepicker__navigation-icon::before {
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
`

export const PresetGroup = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
  align-self: stretch;

  button {
    height: 100%;
    min-height: 44px;
  }
`

export const MainCategorySelect = styled.select`
  height: 32px;
  min-width: 160px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.92rem;
  appearance: none;
  outline: none;

  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
  }

  @media (min-width: 480px) {
    min-width: 200px;
  }
`

export const ErrorBanner = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.error};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};

  @media (min-width: 520px) {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }
`

export const ErrorIcon = styled.span`
  display: inline-flex;
  align-items: center;
`

export const ErrorContent = styled.div`
  min-width: 0;
`

export const ErrorAction = styled.div`
  grid-column: 1 / -1;

  button {
    width: 100%;
  }

  @media (min-width: 520px) {
    grid-column: auto;

    button {
      width: auto;
    }
  }
`

export const ChartStack = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 480px) {
    gap: 16px;
  }
`

export const ChartCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};

  @media (min-width: 480px) {
    padding: 16px;
  }
`

export const ChartHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`

export const ChartHeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;

  @media (min-width: 640px) {
    align-items: flex-end;
  }
`

export const ChartHeaderAction = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const ChartExportActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-start;

  button {
    min-width: 72px;
  }

  @media (min-width: 640px) {
    justify-content: flex-end;
  }
`

export const ChartTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const RangeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  min-height: 32px;
  max-width: 100%;
  padding: 6px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
`

export const ChartSurface = styled.div`
  width: 100%;
  height: 280px;
  overflow: visible;

  .highcharts-container,
  svg {
    max-width: 100%;
    width: 100% !important;
    overflow: visible !important;
  }

  @media (min-width: 380px) {
    height: 300px;
  }

  @media (min-width: 900px) {
    height: 340px;
  }
`

export const ChartNote = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`

export const ExportStatus = styled.div`
  padding: 8px 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.error};
`

export const StatePanel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
`

export const CorrelationCategoryControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const CorrelationScaleNote = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
`

export const CorrelationScaleItem = styled.span<{ $positive: boolean | null }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`

export const CorrelationScaleDot = styled.span<{ $positive: boolean | null }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $positive, theme }) => {
    if ($positive === true) return theme.colors.critical
    if ($positive === false) return theme.colors.primary
    return theme.colors.textMuted
  }};
`
