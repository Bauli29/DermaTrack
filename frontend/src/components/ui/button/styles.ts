'use client'
import styled, { css, keyframes } from 'styled-components'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleProps {
  $variant: ButtonVariant
  $size: ButtonSize
  $fullWidth?: boolean
  disabled?: boolean
}

const focusRing = css`
  outline: 2px solid ${({ theme }) => theme.colors.focus};
  outline-offset: 2px;
`

const press = css`
  transform: translateY(0.5px) scale(0.995);
`

const baseButton = css<ButtonStyleProps>`
  -webkit-tap-highlight-color: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem; /* 8px */
  border: 1px solid transparent;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  position: relative;
  white-space: nowrap;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 50ms ease;

  ${({ $fullWidth }) => ($fullWidth ? 'width: 100%;' : '')}

  /* Sizes */
  ${({ $size }) =>
    $size === 'sm'
      ? css`
          height: 32px;
          padding: 0 12px;
          font-size: 0.875rem; /* 14px */
        `
      : $size === 'lg'
        ? css`
            height: 48px;
            padding: 0 20px;
            font-size: 1rem; /* 16px */
          `
        : css`
            height: 40px;
            padding: 0 16px;
            font-size: 0.9375rem; /* 15px */
          `}

  /* Variants */
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'secondary':
        return css`
          background: ${theme.colors.secondary};
          color: #0b1b13; /* readable on secondary */
          border-color: ${theme.colors.secondary};
          &:hover {
            filter: brightness(0.96);
          }
          &:active {
            ${press}
            filter: brightness(0.92);
          }
        `
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.colors.text};
          border-color: ${theme.colors.border};
          &:hover {
            background: ${theme.colors.hover};
          }
          &:active {
            ${press}
          }
        `
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text};
          border-color: transparent;
          &:hover {
            background: ${theme.colors.hover};
            border-color: ${theme.colors.hover};
          }
          &:active {
            ${press}
          }
        `
      case 'danger':
        return css`
          background: ${theme.colors.error};
          color: #ffffff;
          border-color: ${theme.colors.error};
          &:hover {
            background: #dc2626cc; /* slightly transparent */
          }
          &:active {
            ${press}
          }
        `
      case 'primary':
      default:
        return css`
          background: ${theme.colors.primary};
          color: #ffffff;
          border-color: ${theme.colors.primary};
          &:hover {
            background: ${theme.colors.info};
            border-color: ${theme.colors.info};
          }
          &:active {
            ${press}
          }
        `
    }
  }}

  /* Disabled */
  &:disabled,
  &[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.6;
    filter: grayscale(10%);
    box-shadow: none;
    transform: none;
  }

  /* Focus styles: visible only when needed */
  &:focus-visible {
    ${focusRing}
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const StyledButton = styled.button<ButtonStyleProps>`
  ${baseButton}
`

/* Loading spinner */
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const Spinner = styled.span<{ $size: ButtonSize; $variant: ButtonVariant }>`
  display: inline-block;
  border: 2px solid
    ${({ $variant, theme }) =>
      $variant === 'outline' || $variant === 'ghost'
        ? `${theme.colors.text}80`
        : 'rgba(255, 255, 255, 0.5)'};
  border-top-color: ${({ $variant, theme }) =>
    $variant === 'outline' || $variant === 'ghost' ? theme.colors.text : 'rgba(255, 255, 255, 1)'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  ${({ $size }) =>
    $size === 'sm'
      ? css`
          width: 14px;
          height: 14px;
        `
      : $size === 'lg'
        ? css`
            width: 18px;
            height: 18px;
          `
        : css`
            width: 16px;
            height: 16px;
          `}
`

export const ButtonLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`
