'use client'
import Link from 'next/link'
import styled from 'styled-components'

export const NavBar = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;

  /* iOS safe area support */
  padding-bottom: env(safe-area-inset-bottom);

  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 -2px 8px ${({ theme }) => theme.colors.shadow};
`

export const NavContent = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  max-width: 100%;
  height: 64px;
  padding: 0 8px;

  @media (min-width: 640px) {
    max-width: 640px;
    margin: 0 auto;
  }
`

export const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  text-decoration: none;
  border-radius: 8px;

  /* Active state styling */
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.hover : 'transparent'};

  /* Hover effect (for devices with pointer) */
  @media (hover: hover) {
    &:hover {
      background-color: ${({ theme }) => theme.colors.hover};
    }
  }

  /* Focus visible for keyboard navigation */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`

export const NavIcon = styled.span<{ $isActive: boolean }>`
  font-family: 'Material Symbols Outlined';
  font-size: 24px;
  line-height: 1;
  user-select: none;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textSecondary};

  /* Use filled variant for active state */
  font-variation-settings: ${({ $isActive }) =>
    $isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300"};
`

export const NavLabel = styled.span<{ $isActive: boolean }>`
  font-size: 12px;
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '400')};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
