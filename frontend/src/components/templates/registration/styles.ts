'use client'
import styled from 'styled-components'

export {
  AuthPageWrapper as RegistrationPageWrapper,
  Label,
  SignInPrompt,
} from '../shared/styles'

export const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
  width: 100%;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
`

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0.25rem 0;
  padding: 0.25rem 0;
`

export const Checkbox = styled.input`
  width: 1.125rem;
  height: 1.125rem;
  margin: 0;
  margin-top: 0.125rem;
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
