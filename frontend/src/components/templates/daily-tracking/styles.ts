'use client'
import styled from 'styled-components'

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 4px 0;

  & + & {
    padding-top: 14px;
    border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  }
`
export const PageWrapper = styled.main`
  width: 100%;
  min-height: calc(100dvh - 128px);
  max-width: 1120px;
  margin: 0 auto;
  padding: 12px 12px 20px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 480px) {
    padding: 16px;
    gap: 16px;
  }

  @media (min-width: 900px) {
    padding: 20px 24px 24px;
  }
`

export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const SubsectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
  font-weight: 400;

  &:not(:first-child) {
    border-top: 1px dashed ${({ theme }) => theme.colors.borderLight};
    padding-top: 12px;
  }
`

export const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 0;
`

export const SliderWithMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 4px;
  gap: 2px;
`

export const SliderFieldHelperText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 400;
  font-family: inherit;
  margin-top: 2px;
`

export const SliderValue = styled.span`
  width: 3ch;
  text-align: right;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accentText};
  font-size: 0.9rem;
`

export const Label = styled.label`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.label};
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;
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

export const ImagePreviewContent = styled.div`
  width: 100%;
  padding: 6px;
`

export const ImagePreviewName = styled.div`
  margin-bottom: 4px;
  word-break: break-word;
`

export const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  padding: 0 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }

  input[type='file'] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`

export const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  gap: 8px;
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
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
`
