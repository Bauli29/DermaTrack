'use client'
import styled from 'styled-components'

export const TestPageWrapper = styled.div`
  padding: 20px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`
