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

export const CalendarCard = styled.section`
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

export const CalendarHeader = styled.div`
  display: grid;
  gap: 10px;

  @media (min-width: 680px) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
`

export const MonthTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`

export const MonthControls = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  button {
    width: 100%;
    min-width: 0;
    padding-inline: 8px;
  }

  @media (min-width: 420px) {
    display: flex;
    justify-content: flex-start;

    button {
      width: auto;
    }
  }
`

export const CalendarSurface = styled.div`
  width: 100%;
  height: 360px;
  overflow: visible;

  .highcharts-container,
  svg {
    max-width: 100%;
    width: 100% !important;
    overflow: visible !important;
  }

  @media (min-width: 480px) {
    height: 390px;
  }

  @media (min-width: 900px) {
    height: 430px;
  }
`

export const DetailGrid = styled.section`
  display: grid;
  gap: 12px;

  @media (min-width: 860px) {
    grid-template-columns: minmax(0, 1fr) 300px;
    align-items: start;
  }
`

export const DetailCard = styled.section`
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

export const DetailHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`

export const MetricTile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 64px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
`

export const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
`

export const MetricValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
`

export const ActionRow = styled.div`
  display: grid;
  gap: 8px;

  @media (min-width: 420px) {
    grid-template-columns: max-content max-content;
  }
`

export const NoticePanel = styled.section`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
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

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`

export const EntryImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.card};
`
