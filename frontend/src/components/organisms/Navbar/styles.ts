'use client'
import Link from 'next/link'
import styled, { css } from 'styled-components'

// used from NavLink and NavActionButton
const navItemLayout = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 8px;
`
// used from NavLink and NavActionButton
const navItemFocus = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`

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
  height: var(--navbar-height, 64px);
  padding: 0 8px;

  @media (min-width: 640px) {
    max-width: 640px;
    margin: 0 auto;
  }
`

export const NavLink = styled(Link)<{ $isActive: boolean }>`
  ${navItemLayout}
  text-decoration: none;

  /* Hover effect (for devices with pointer) */
  @media (hover: hover) {
    &:hover {
      background-color: ${({ theme }) => theme.colors.hover};
    }
  }

  ${navItemFocus}
`

export const NavActionButton = styled.button`
  ${navItemLayout}
  border: none;
  background: transparent;
  cursor: pointer;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.hover};
    }
  }

  ${navItemFocus}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`
