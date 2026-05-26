'use client'

import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 128px);
`

const Spinner = styled.span`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.textMuted}40;
  border-top-color: ${({ theme }) => theme.colors.textMuted};
  display: inline-block;
  animation: ${spin} 0.75s linear infinite;
`

const PageSpinner = () => (
  <Wrapper>
    <Spinner />
  </Wrapper>
)

export default PageSpinner
