'use client'
import styled from 'styled-components'

// Wrapper for the template page. Designed mobile-first with generous spacing
export const PageWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  gap: 16px;
`

// Card-like surface for the form
export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr; /* stack on mobile */
  align-items: center;
  gap: 8px;

  @media (min-width: 520px) {
    grid-template-columns: 12ch 1fr 3ch; /* fixed label | slider | fixed value */
    align-items: center;
    column-gap: 12px;
  }
`

export const SliderValue = styled.span`
  width: 3ch; /* ensure consistent space for 0-10 */
  text-align: right;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`

export const Label = styled.label`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const NoteTextarea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.active};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus}33;
  }
`

export const ImagePicker = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

export const ImagePreviewItem = styled.div`
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.card};
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px;
  text-align: center;
`

export const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 440px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
`

export const SuccessText = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.9rem;
`

export const HelperText = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`

export const DateInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    border-color: ${({ theme }) => theme.colors.active};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus}33;
    outline: none;
  }
`
