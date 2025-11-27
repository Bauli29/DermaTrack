'use client'
import styled from 'styled-components'

// Removed unused imports and helper functions for validation colors

export const LoginPageWrapper = styled.div`
  padding: 20px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

// Card-like surface for the form
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
