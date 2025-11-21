'use client'
import styled from 'styled-components'
import type { TValidationState } from '@/components/molecules/TextArea/types'
import type { ITheme } from '@/lib/themes'

// Helper functions for validation colors
const getValidationBorderColor = (
  validation: TValidationState,
  theme: ITheme
) => {
  if (validation === 'success') return theme.colors.success
  if (validation === 'error') return theme.colors.error
  return theme.colors.border
}

const getValidationFocusBorderColor = (
  validation: TValidationState,
  theme: ITheme
) => {
  if (validation === 'success') return theme.colors.success
  if (validation === 'error') return theme.colors.error
  return theme.colors.primary
}

const getValidationBoxShadow = (
  validation: TValidationState,
  theme: ITheme
) => {
  if (validation === 'success') return `0 0 0 3px ${theme.colors.success}20`
  if (validation === 'error') return `0 0 0 3px ${theme.colors.error}20`
  return `0 0 0 3px ${theme.colors.primary}20`
}

const getHoverBorderColor = (validation: TValidationState, theme: ITheme) => {
  if (validation === 'success') return theme.colors.success
  if (validation === 'error') return theme.colors.error
  return theme.colors.borderLight
}

export const RegistrationPageWrapper = styled.div`
  padding: 20px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

// Card-like surface for the form - identical to login
export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: 16px;
  width: 100%;
  max-width: 500px; /* verhindert zu großen Karten auf Desktop */
  margin-inline: 16px; /* Abstand zu den Rändern auf kleinen Bildschirmen */
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const Label = styled.label`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const SignInPrompt = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
`

// Zusätzliche Styles für die Registrierung
export const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0.5rem 0;
`

export const Checkbox = styled.input`
  width: 1.125rem;
  height: 1.125rem;
  margin: 0;
  margin-top: 0.125rem; /* Align with first line of text */

  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const CheckboxLabel = styled.label`
  cursor: pointer;
  flex: 1;
  line-height: 1.4;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`

// Password field components
export const PasswordContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

export const PasswordLabel = styled.div`
  margin-bottom: 0.5rem;
`

export const PasswordFieldWrapper = styled.div`
  position: relative;
  width: 100%;
`

export const PasswordInput = styled.input<{ $validation: TValidationState }>`
  width: 100%;
  padding: 0.875rem 5.5rem 0.875rem 1rem;
  border-radius: 0.5rem;
  border: 2px solid
    ${({ theme, $validation }) => getValidationBorderColor($validation, theme)};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  font-size: 1rem;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 1;
  }

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.card};
    border-color: ${({ theme, $validation }) =>
      getHoverBorderColor($validation, theme)};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $validation }) =>
      getValidationFocusBorderColor($validation, theme)};
    box-shadow: ${({ theme, $validation }) =>
      getValidationBoxShadow($validation, theme)};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
    border-color: ${({ theme }) => theme.colors.border};
  }
`

export const PasswordToggleIcon = styled.button<{ $visible: boolean }>`
  position: absolute;
  top: 50%;
  right: 3.5rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? '0.7' : '0.4')};

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 4px;
  }
`

export const PasswordStatusIcon = styled.div<{
  $visible: boolean
  $type: 'success' | 'error'
}>`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  pointer-events: none;
`

export const PasswordHelperText = styled.div<{ $error?: boolean }>`
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: ${({ theme, $error }) =>
    $error ? theme.colors.error : theme.colors.textMuted};
`
