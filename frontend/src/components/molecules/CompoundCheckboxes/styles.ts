'use client'

import styled from 'styled-components'

import type { IStyledCompoundCheckboxesProps } from './types'

export const Container = styled.div<IStyledCompoundCheckboxesProps>`
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
      $selected
        ? theme.colors.optionBorderSelected
        : theme.colors.optionBorder};

  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.optionBgSelected : theme.colors.optionBg};

  box-shadow: ${({ theme, $selected }) =>
    $selected ? `0 8px 20px ${theme.colors.optionShadowSelected}` : 'none'};

  opacity: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.optionDisabledOpacity : 1};

  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: ${({ theme, $selected }) =>
      $selected
        ? theme.colors.optionBorderSelected
        : theme.colors.optionHoverBorder};
  }
`

export const OptionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  width: 100%;
`

export const StyledCheckbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.25rem;
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`

export const OptionLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const HelperText = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.85;
`

export const DetailInputContainer = styled.div`
  margin-top: 0.75rem;
  margin-left: 2rem;
  width: 100%;
  max-width: calc(100% - 2rem);
`
