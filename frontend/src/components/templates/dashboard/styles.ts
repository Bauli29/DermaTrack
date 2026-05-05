'use client'
import styled, { type DefaultTheme } from 'styled-components'

import Link from '@/components/atoms/Link'

import type { TDashboardTrendTone } from './utils'

const getTrendColor = (
  tone: TDashboardTrendTone,
  theme: DefaultTheme
): string => {
  switch (tone) {
    case 'improving':
      return theme.colors.success
    case 'stable':
      return theme.colors.info
    case 'worsening':
      return theme.colors.error
    case 'unknown':
      return theme.colors.textSecondary
  }
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

export const ActionBar = styled.nav`
  display: grid;
  gap: 8px;

  @media (min-width: 520px) {
    grid-template-columns: repeat(2, minmax(0, max-content));
  }
`

export const ActionLink = styled(Link)<{ $prominent?: boolean }>`
  min-height: 42px;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid
    ${({ $prominent, theme }) =>
      $prominent ? theme.colors.primary : theme.colors.border};
  border-radius: 8px;
  background: ${({ $prominent, theme }) =>
    $prominent ? theme.colors.primary : theme.colors.surface};
  color: ${({ $prominent, theme }) =>
    $prominent ? theme.colors.surface : theme.colors.textSecondary};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.35;
  text-decoration: none;

  &:hover {
    opacity: 0.9;
    text-decoration: none;
  }

  @media (min-width: 520px) {
    min-width: 148px;
  }
`

export const SummaryGrid = styled.section`
  display: grid;
  gap: 10px;

  @media (min-width: 540px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 960px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

export const SummaryCard = styled.article`
  display: grid;
  grid-template-rows: auto minmax(32px, auto) auto;
  gap: 8px;
  min-width: 0;
  min-height: 132px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`

export const CardHeader = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: center;
`

export const CardIcon = styled.span<{ $tone?: TDashboardTrendTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid
    ${({ $tone, theme }) =>
      $tone ? getTrendColor($tone, theme) : theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
`

export const CardLabel = styled.span`
  min-width: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25;
  text-transform: uppercase;
  overflow-wrap: anywhere;
`

export const CardValue = styled.span<{ $tone?: TDashboardTrendTone }>`
  color: ${({ $tone, theme }) =>
    $tone ? getTrendColor($tone, theme) : theme.colors.text};
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
`

export const CardMeta = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.82rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
`

export const ContentGrid = styled.section`
  display: grid;
  gap: 12px;

  @media (min-width: 860px) {
    grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
    align-items: start;
  }
`

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};

  @media (min-width: 480px) {
    padding: 16px;
  }
`

export const PanelHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const InsightList = styled.div`
  display: grid;
  gap: 8px;
`

export const InsightRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  min-width: 0;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
`

export const InsightIcon = styled.span<{ $tone?: TDashboardTrendTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: ${({ $tone, theme }) =>
    $tone ? getTrendColor($tone, theme) : theme.colors.primary};
`

export const InsightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`

export const InsightTitle = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
`

export const InsightText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.82rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
`

export const StatePanel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
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
