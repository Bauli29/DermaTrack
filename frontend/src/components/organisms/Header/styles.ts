'use client'
import styled from 'styled-components'

// Sticky top bar that respects iOS safe areas
export const Header = styled.header`
  position: fixed;
  top: 0;
  z-index: 99;
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: grid;
  grid-template-columns: 1fr auto 1fr; /* left/right size to content; title flexes */
  column-gap: 8px;
  align-items: center;
  height: 64px; /* larger, thumb-friendly mobile touch target */
  padding: env(safe-area-inset-top, 0px) 12px 0;
`

export const Left = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0; /* allow overflow handling */
`

export const Center = styled.div`
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

export const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  min-width: 0;
  padding-right: 8px;
`

export const BackButton = styled.div`
  display: flex;
  align-items: center;

  button {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
  }

  span {
    line-height: 1;
  }
`
