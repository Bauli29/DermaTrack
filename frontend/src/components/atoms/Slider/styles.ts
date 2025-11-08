'use client'

import styled, { css } from 'styled-components'

import { ITheme } from '@/lib/themes'

import {
  IStyledSliderFillProps,
  IStyledSliderThumbProps,
  IStyledSliderTrackProps,
  IStyledSliderWrapperProps,
} from './types'

const sliderConfig = {
  height: '0.375rem', // 6px
  thumbSize: '1.125rem', // 18px
}

const colorStyles = (theme: ITheme) => ({
  primary: {
    track: theme.colors.borderLight,
    fill: theme.colors.primary,
    thumb: theme.colors.primary,
  },
  secondary: {
    track: theme.colors.borderLight,
    fill: theme.colors.secondary,
    thumb: theme.colors.secondary,
  },
})

export const SliderWrapper = styled.div<IStyledSliderWrapperProps>`
  position: relative;
  width: ${({ $width }) => $width ?? '100%'};
  max-width: ${({ $maxWidth }) => $maxWidth ?? '400px'};
  margin: ${({ $margin }) => $margin ?? '1rem 0'};
  padding: ${`calc(${sliderConfig.thumbSize} / 2) 0`};
  cursor: pointer;
`

export const SliderTrack = styled.div<IStyledSliderTrackProps>`
  width: 100%;
  height: ${sliderConfig.height};
  background-color: ${({ theme, $color }) => colorStyles(theme)[$color].track};
  border-radius: ${sliderConfig.height};
  position: relative;
  overflow: hidden;
`

export const SliderFill = styled.div<IStyledSliderFillProps>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${({ $percentage }) => `${$percentage}%`};
  background-color: ${({ theme, $color, $disabled }) =>
    $disabled ? theme.colors.textMuted : colorStyles(theme)[$color].fill};
  border-radius: inherit;
  transition: all 0.2s ease;
`

export const SliderThumb = styled.div<IStyledSliderThumbProps>`
  position: absolute;
  top: 50%;
  left: ${({ $percentage }) => `${$percentage}%`};
  width: ${sliderConfig.thumbSize};
  height: ${sliderConfig.thumbSize};
  background-color: ${({ theme, $color, $disabled }) =>
    $disabled ? theme.colors.textMuted : colorStyles(theme)[$color].thumb};
  border: 2px solid ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'grab')};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  z-index: 2;

  ${({ $isDragging }) =>
    $isDragging &&
    css`
      cursor: grabbing;
      transform: translate(-50%, -50%) scale(1.1);
    `}

  &:hover {
    ${({ $disabled }) =>
      !$disabled &&
      css`
        transform: translate(-50%, -50%) scale(1.05);
        box-shadow: 0 4px 8px ${({ theme }) => theme.colors.shadow};
      `}
  }

  &:focus {
    outline: 2px solid
      ${({ theme, $color }) => colorStyles(theme)[$color].thumb};
    outline-offset: 2px;
  }
`
