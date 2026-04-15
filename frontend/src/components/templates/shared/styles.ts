'use client'
import styled from 'styled-components'

export const PageWrapper = styled.div`
  padding: 16px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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
