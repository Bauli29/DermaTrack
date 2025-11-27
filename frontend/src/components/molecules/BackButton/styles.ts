'use client'
import styled from 'styled-components'

export const BackButtonWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem; /* narrow spacing to mimic native back */
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`
