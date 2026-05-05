'use client'
import styled, { type DefaultTheme } from 'styled-components'

type TFactorImpactTone = 'higher' | 'lower' | 'neutral'

const getFactorDeltaColor = (
  tone: TFactorImpactTone,
  theme: DefaultTheme
): string => {
  switch (tone) {
    case 'higher':
      return theme.colors.error
    case 'lower':
      return theme.colors.success
    case 'neutral':
      return theme.colors.textSecondary
  }
}

const getFactorDeltaBorderColor = (
  tone: TFactorImpactTone,
  theme: DefaultTheme
): string => {
  if (tone === 'neutral') {
    return theme.colors.border
  }

  return getFactorDeltaColor(tone, theme)
}

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
  display: grid;
  gap: 10px;

  @media (min-width: 740px) {
    grid-template-columns: minmax(0, 1fr) minmax(280px, auto);
    align-items: stretch;
  }
`

export const FilterPanel = styled.div`
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

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const DateControls = styled.div`
  display: grid;
  gap: 8px;

  button {
    width: 100%;
  }

  @media (min-width: 440px) {
    grid-template-columns: minmax(0, 1fr) max-content;
    align-items: end;

    button {
      width: auto;
    }
  }
`

export const PeriodControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 8px;

  button {
    width: 100%;
    min-width: 0;
    padding-inline: 8px;
  }
`

export const RangeSummary = styled.div`
  display: grid;
  gap: 8px;
  align-content: start;

  @media (min-width: 380px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 740px) {
    grid-template-columns: 1fr;
  }
`

export const SummaryPill = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 64px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`

export const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
`

export const SummaryValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;

  @media (min-width: 480px) {
    font-size: 0.95rem;
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

export const WarningBanner = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
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

export const ChartTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const ChartHeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  button {
    min-width: 72px;
  }

  @media (min-width: 640px) {
    justify-content: flex-end;
  }
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

export const SeriesSnapshot = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 380px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 720px) {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
`

export const SeriesChip = styled.div`
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  min-height: 48px;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
`

export const SeriesSwatch = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`

export const SeriesName = styled.span`
  min-width: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.78rem;
  line-height: 1.2;
  overflow-wrap: anywhere;
`

export const SeriesValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.86rem;
  font-weight: 700;
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

export const InsightsPanel = styled.section`
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

export const InsightsHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`

export const InsightsHeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  @media (min-width: 640px) {
    justify-content: flex-end;
  }
`

export const InsightsFilters = styled.div`
  display: grid;
  gap: 8px;

  @media (min-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 220px));
  }
`

export const FilterControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const FilterLabel = styled.label`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
`

export const WeightingNote = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
`

export const WeightList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const WeightItem = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.78rem;
  line-height: 1.2;
`

export const FactorSummary = styled.div`
  display: grid;
  gap: 8px;

  @media (min-width: 420px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const FactorGrid = styled.div`
  display: grid;
  gap: 10px;

  @media (min-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const FactorCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
`

export const FactorCardHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
`

export const FactorTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

export const FactorCategory = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
`

export const FactorName = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
`

export const FactorDelta = styled.span<{ $tone: TFactorImpactTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid
    ${({ $tone, theme }) => getFactorDeltaBorderColor($tone, theme)};
  color: ${({ $tone, theme }) => getFactorDeltaColor($tone, theme)};
  background: ${({ theme }) => theme.colors.surface};
  font-size: 0.86rem;
  font-weight: 700;
`

export const FactorMetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`

export const FactorMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
`
