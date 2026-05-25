'use client'

import Link from 'next/link'
import styled from 'styled-components'

export const PageWrapper = styled.main`
  width: 100%;
  min-height: calc(100dvh - 128px);
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 12px 24px;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at top left,
        rgba(84, 153, 199, 0.14),
        transparent 42%
      ),
      radial-gradient(
        circle at top right,
        rgba(142, 198, 132, 0.12),
        transparent 38%
      );
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (min-width: 640px) {
    padding: 20px 18px 28px;
  }

  @media (min-width: 960px) {
    padding: 24px;
  }
`

export const HeroCard = styled.section`
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.surface} 0%,
    ${({ theme }) => theme.colors.card} 100%
  );
  box-shadow: 0 8px 24px ${({ theme }) => theme.colors.shadow};

  @media (min-width: 720px) {
    grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
    align-items: end;
  }
`

export const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

export const HeroNote = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.92rem;
  line-height: 1.5;
`

export const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (min-width: 560px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

export const StatTile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.background};
`

export const StatLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const StatValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`

export const MainGrid = styled.section`
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const CardGrid = styled.section`
  display: grid;
  gap: 20px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
  }
`

export const CalendarCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 18px ${({ theme }) => theme.colors.shadow};
`

export const WeekSurface = styled.div`
  display: grid;
  gap: 12px;
  padding-bottom: 4px;
`

export const WeekScroller = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
`

export const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(96px, 1fr));
  gap: 10px;
  min-width: 100%;
`

export const WeekDayCard = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 96px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : theme.colors.borderLight};
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.background : theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 6px 16px ${({ theme }) => theme.colors.shadow};
  }
`

export const WeekDayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const WeekDayLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

export const WeekDayDate = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  font-weight: 700;
`

export const WeekDayValue = styled.span<{
  $tone: 'low' | 'moderate' | 'high' | 'severe' | 'empty'
}>`
  display: inline-flex;
  align-self: flex-start;
  padding: 6px 10px;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  font-weight: 700;
  background: ${({ $tone, theme }) => {
    if ($tone === 'low') return theme.colors.healthy
    if ($tone === 'moderate') return theme.colors.info
    if ($tone === 'high') return theme.colors.attention
    if ($tone === 'severe') return theme.colors.critical
    return theme.colors.background
  }};
`

export const WeekLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  justify-content: center;
`

export const WeekLegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.78rem;
  font-weight: 600;
`

export const WeekLegendDot = styled.span<{
  $tone: 'low' | 'moderate' | 'high' | 'severe'
}>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $tone, theme }) => {
    if ($tone === 'low') return theme.colors.healthy
    if ($tone === 'moderate') return theme.colors.info
    if ($tone === 'high') return theme.colors.attention
    return theme.colors.critical
  }};
`

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const CalendarSurface = styled.div`
  width: 100%;
  height: 340px;
  overflow: visible;

  .highcharts-container,
  svg {
    max-width: 100%;
    width: 100% !important;
    overflow: visible !important;
  }

  @media (min-width: 560px) {
    height: 370px;
  }

  @media (min-width: 960px) {
    height: 420px;
  }
`

export const DetailGrid = styled.div`
  display: grid;
  gap: 12px;
`

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.card};
`

export const CardPanel = styled(Panel)`
  min-width: 0;
`

export const FullWidthCardPanel = styled(CardPanel)`
  @media (min-width: 900px) {
    grid-column: 1 / -1;
  }
`

export const NoticePanel = styled(Panel)`
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
`

export const ActionGrid = styled.div`
  display: grid;
  gap: 10px;
`

export const ActionLink = styled(Link)`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.background},
    ${({ theme }) => theme.colors.surface}
  );
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 6px 16px ${({ theme }) => theme.colors.shadow};
    outline: none;
  }
`

export const ActionIcon = styled.span`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`

export const ActionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

export const ActionMeta = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.82rem;
`

export const ActionButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const InsightGrid = styled.div`
  display: grid;
  gap: 10px;

  @media (min-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const InsightMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background};
`

export const InsightLabel = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

export const InsightValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.96rem;
  font-weight: 700;
`

export const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 600;
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
`
