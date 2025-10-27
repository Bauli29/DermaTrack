'use client'
import styled from 'styled-components'

export const TestPageWrapper = styled.div`
  padding: 20px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
`
export const ExampleDiv = styled.div`
  background-color: ${({ theme }) => theme.colors.error};
  height: 50px;
  width: 50px;
  margin: 10px;
  border-radius: 5px;
`
