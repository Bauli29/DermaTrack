'use client'
import styled from 'styled-components'

// Sticky top bar that respects iOS safe areas
export const HeaderBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 100; /* keep above page content */
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: env(safe-area-inset-top, 0px);
`

// Main row with three areas: back (left), title (center), brand (right)
export const BarContent = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto; /* left/right size to content; title flexes */
  column-gap: 8px;
  align-items: center;
  height: 64px; /* larger, thumb-friendly mobile touch target */
  padding: 0 12px;
`

export const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0; /* allow overflow handling */
`

export const CenterGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  text-align: center;
  /* Let long titles truncate in the center */
  & > * {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`

export const RightGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
`

export const BreadcrumbRow = styled.div`
  padding: 0 12px 8px 12px;
`
