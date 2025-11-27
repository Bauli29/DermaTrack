'use client'
import styled from 'styled-components'

export const RegistrationPageWrapper = styled.div`
  padding: 20px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: 16px;
  width: 100%;
  max-width: 500px;
  margin-inline: 16px;
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

export const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

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
