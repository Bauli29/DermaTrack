'use client'

import styled from 'styled-components'

export { PageWrapper as TestPageWrapper } from '../shared/styles'

interface IConstrainedBlockProps {
  $maxWidth: string
}

export const ButtonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
`

export const IconRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
`

export const ShowcaseGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  width: 100%;
`

export const ShowcaseColumn = styled.div<IConstrainedBlockProps>`
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth};
`

export const ShowcaseStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

export const ConstrainedTextBlock = styled.div<IConstrainedBlockProps>`
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth};
`
