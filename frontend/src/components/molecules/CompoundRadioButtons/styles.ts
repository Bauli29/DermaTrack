'use client'

import styled from 'styled-components'

import type { IStyledCompoundRadioButtonsProps } from './types'

export const Container = styled.div<IStyledCompoundRadioButtonsProps>`
  width: 100%;
  ${({ $margin }) => $margin && `margin: ${$margin};`}
`

export const Fieldset = styled.fieldset`
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
`

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`

export const OptionCard = styled.div<{
  $selected: boolean
  $disabled: boolean
}>`
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 0.875rem;
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.card : theme.colors.surface};
  box-shadow: ${({ theme, $selected }) =>
    $selected ? `0 8px 20px ${theme.colors.shadow}` : 'none'};
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
  opacity: ${({ $disabled }) => ($disabled ? 0.75 : 1)};

  &:hover {
    border-color: ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.colors.borderLight};
    background: ${({ theme, $selected }) =>
      $selected ? theme.colors.card : theme.colors.card};
  }
`

export const OptionHelper = styled.div`
  margin-top: 0.375rem;
  margin-left: 1.875rem;
`

export const DetailPanel = styled.div`
  margin-top: 0.875rem;
  margin-left: 1.875rem;
  padding: 0.875rem;
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 0.75rem;
  background: ${({ theme }) => theme.colors.surface};
`
