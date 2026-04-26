'use client'

import styled from 'styled-components'

import type { IStyledSelectProps, IStyledSelectWrapperProps } from './types'

export const Wrapper = styled.div<IStyledSelectWrapperProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  ${({ $fullWidth }) => ($fullWidth ? 'width: 100%;' : 'width: auto;')}
  ${({ $width }) => $width && `width: ${$width};`}
  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth};`}
  ${({ $margin }) => $margin && `margin: ${$margin};`}
`

export const Select = styled.select<IStyledSelectProps>`
  width: 100%;
  min-height: 2.5rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  font-size: 1rem;
  line-height: 1.5;
  box-sizing: border-box;
  appearance: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;

  &:hover {
    background: ${({ theme, $disabled }) =>
      $disabled ? theme.colors.surface : theme.colors.card};
    border-color: ${({ theme, $disabled }) =>
      $disabled ? theme.colors.border : theme.colors.borderLight};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.focus};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.focus}33`};
    background: ${({ theme }) => theme.colors.surface};
  }

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
  }
`

export const Indicator = styled.span`
  position: absolute;
  top: 0;
  right: 0.75rem;
  bottom: 0;
  display: inline-flex;
  align-items: center;
  pointer-events: none;
`
