'use client'

import styled from 'styled-components'

import type {
  IStyledRadioIndicatorProps,
  IStyledRadioLabelProps,
} from './types'

export const Label = styled.label<IStyledRadioLabelProps>`
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`

export const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;

  &:focus-visible + span {
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.focus}33`};
  }
`

export const Indicator = styled.span<IStyledRadioIndicatorProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 1.125rem;
  height: 1.125rem;
  margin-top: 0.125rem;
  border-radius: 999px;
  border: 1.5px solid
    ${({ theme, $checked, $disabled }) => {
      if ($disabled) return theme.colors.border
      return $checked ? theme.colors.primary : theme.colors.border
    }};
  background: ${({ theme, $checked, $disabled }) => {
    if ($disabled) return theme.colors.card
    return $checked ? theme.colors.hover : theme.colors.surface
  }};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;

  &::after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.primary};
    transform: scale(${({ $checked }) => ($checked ? 1 : 0)});
    transition: transform 0.15s ease;
  }
`
