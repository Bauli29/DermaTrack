'use client'
import NextLink from 'next/link'
import styled, { css } from 'styled-components'

import { ITheme } from '@/lib/themes'

import { IStyledLinkProps } from './types'

const variantStyles = (theme: ITheme) => ({
  default: css`
    color: ${theme.colors.text};
  `,
  primary: css`
    color: ${theme.colors.primary};
  `,
  secondary: css`
    color: ${theme.colors.secondary};
  `,
  muted: css`
    color: ${theme.colors.textSecondary};
  `,
})

export const StyledLink = styled(NextLink)<IStyledLinkProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  text-decoration: ${({ $underline }) => ($underline ? 'underline' : 'none')};
  transition: all 0.2s ease;
  font-size: inherit;
  line-height: inherit;

  ${({ $variant, theme }) => variantStyles(theme)[$variant]}

  ${({ $disabled }) =>
    $disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.6;
      pointer-events: none;
    `}

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`

export const ExternalLinkWrapper = styled.a<IStyledLinkProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  text-decoration: ${({ $underline }) => ($underline ? 'underline' : 'none')};
  transition: all 0.2s ease;
  font-size: inherit;
  line-height: inherit;

  ${({ $variant, theme }) => variantStyles(theme)[$variant]}

  ${({ $disabled }) =>
    $disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.6;
      pointer-events: none;
    `}

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`

export const ExternalIcon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.875em;
  margin-left: 0.125rem;
  color: inherit; // Inherit color from parent
`
