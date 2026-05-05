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

export const AuthPageWrapper = styled.div`
  width: 100%;
  min-height: calc(100dvh - 128px);
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 0.875rem;

  @media (min-width: 640px) {
    padding: 1.5rem max(1rem, calc((100vw - 640px) / 2 + 1rem));
  }
`

export const Label = styled.label`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const SignInPrompt = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
  justify-content: center;
  align-items: center;
`
