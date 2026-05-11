'use client'

import styled from 'styled-components'

export const PageWrapper = styled.main`
  width: 100%;
  min-height: 100vh;

  display: flex;
  justify-content: center;

  padding: 40px 16px 80px;
`

export const Content = styled.div`
  width: 100%;
  max-width: 760px;

  display: flex;
  flex-direction: column;

  gap: 14px;

  /* remove "card UI" feeling */
  padding: 0;
  background: transparent;
  box-shadow: none;
`

export const Header = styled.div`
  display: flex;
  flex-direction: column;

  gap: 2px;

  margin-bottom: 0px;
`

/**
 * MAIN TITLE — neutral dark grey (NO BLUE)
 */
export const Title = styled.h1`
  font-size: 2.1rem;
  font-weight: 700;

  color: ${({ theme }) => theme.colors.text};

  letter-spacing: -0.02em;
`

export const LastUpdated = styled.p`
  font-size: 0.9rem;

  color: ${({ theme }) => theme.colors.textMuted};
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;

  gap: 4px;

  /* subtle spacing only, no visual divider */
  padding-top: 10px;
`

/**
 * SUBHEADINGS — SAME COLOR AS TITLE (dark grey family)
 * but slightly lighter weight/size for hierarchy
 */
export const SectionTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.text};

  line-height: 1.35;
`

export const Paragraph = styled.p`
  font-size: 0.98rem;
  line-height: 1.65;

  color: ${({ theme }) => theme.colors.textSecondary};

  margin: 0;
`
