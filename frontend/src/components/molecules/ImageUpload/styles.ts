'use client'

import styled from 'styled-components'

export const ImageUploadRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const ImageUploadToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

export const UploadMeta = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`

export const FileInputLabel = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: background 0.15s ease;

  &:hover {
    background: ${({ $disabled, theme }) =>
      $disabled ? theme.colors.surface : theme.colors.hover};
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

export const HelperText = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`

export const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  gap: 10px;
`

export const EmptyState = styled.div`
  min-height: 7rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  text-align: center;
  font-size: 0.9rem;
`

export const ImagePreviewItem = styled.figure`
  position: relative;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.card};
  aspect-ratio: 1 / 1;
`

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`

export const PreviewOverlay = styled.figcaption`
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.72));
  color: #ffffff;
`

export const ImageName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8rem;
`
