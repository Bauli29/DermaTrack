'use client'
import styled from 'styled-components'

import Button from '@/components/atoms/Button'

export const ToggleButton = styled(Button)`
  width: 2.5rem;
  min-width: 2.5rem;
  padding: 0;
  border-radius: 999px;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.hover};
    filter: none;
  }
`
