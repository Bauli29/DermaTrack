'use client'
import styled, { css } from 'styled-components'

export const BrandContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem; /* 8px spacing between logo and name */
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  user-select: none;
`

const logoSizes = {
  sm: css`
    width: 1.5rem; /* 24px */
    height: 1.5rem;
  `,
  md: css`
    width: 1.75rem; /* 28px */
    height: 1.75rem;
  `,
  lg: css`
    width: 2rem; /* 32px */
    height: 2rem;
  `,
}

export const LogoBox = styled.span<{ $size: 'sm' | 'md' | 'lg' }>`
  position: relative;
  display: inline-flex;
  border-radius: 0.5rem; /* soft rounded square to hold the image */
  overflow: hidden;
  background: ${({ theme }) => theme.colors.card};
  box-shadow: 0 1px 2px ${({ theme }) => theme.colors.shadow};
  ${p => logoSizes[p.$size]}

  /* Next.js Image with fill requires a positioned parent */
  & > img, & > span > img {
    object-fit: cover;
  }
`

export const FallbackAvatar = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  background: ${({ theme }) => theme.colors.primary};
`
