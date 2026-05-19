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

export const ContentPageWrapper = styled.div`
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
