'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as SC from './styles'
import { ISliderProps } from './types'
import {
  getNextSliderValueForKey,
  getSliderPercentage,
  getSliderValueFromClientX,
  normalizeSliderValue,
} from './utils'

const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  color = 'primary',
  disabled = false,
  onChange,
  width,
  maxWidth,
  margin,
  onMouseDown,
  onTouchStart,
  onKeyDown,
  'aria-label': ariaLabel,
  ...props
}: ISliderProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const sliderConfig = useMemo(() => ({ min, max, step }), [min, max, step])

  const percentage = getSliderPercentage(value, sliderConfig)

  const emitNormalizedValue = useCallback(
    (val: number) => {
      onChange(normalizeSliderValue(val, sliderConfig))
    },
    [onChange, sliderConfig]
  )

  const calculateValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) {
        return value
      }

      return getSliderValueFromClientX(
        clientX,
        sliderRef.current.getBoundingClientRect(),
        sliderConfig
      )
    },
    [sliderConfig, value]
  )

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled) return

      const newValue = calculateValueFromPosition(clientX)
      setIsDragging(true)
      emitNormalizedValue(newValue)
    },
    [disabled, calculateValueFromPosition, emitNormalizedValue]
  )

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled) return

      const newValue = calculateValueFromPosition(clientX)
      emitNormalizedValue(newValue)
    },
    [isDragging, disabled, calculateValueFromPosition, emitNormalizedValue]
  )

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
  }, [isDragging])

  const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseDown?.(e)
    if (e.defaultPrevented) {
      return
    }

    e.preventDefault()
    handleStart(e.clientX)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX)
    },
    [handleMove]
  )

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  const handleSliderTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    onTouchStart?.(e)
    if (e.defaultPrevented) {
      return
    }

    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX)
    }
  }

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX)
      }
    },
    [handleMove]
  )

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  const handleThumbKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e)
      if (e.defaultPrevented || disabled) {
        return
      }

      const nextValue = getNextSliderValueForKey(e.key, value, sliderConfig)
      if (nextValue === null || nextValue === value) {
        return
      }

      e.preventDefault()
      onChange(nextValue)
    },
    [disabled, onChange, onKeyDown, sliderConfig, value]
  )

  useEffect(() => {
    if (!isDragging) return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ])

  return (
    <SC.SliderWrapper
      ref={sliderRef}
      $width={width}
      $maxWidth={maxWidth}
      $margin={margin}
      {...props}
      onMouseDown={handleSliderMouseDown}
      onTouchStart={handleSliderTouchStart}
    >
      <SC.SliderTrack $color={color} $disabled={disabled}>
        <SC.SliderFill
          $color={color}
          $percentage={percentage}
          $disabled={disabled}
        />
      </SC.SliderTrack>

      <SC.SliderThumb
        $color={color}
        $disabled={disabled}
        $percentage={percentage}
        $isDragging={isDragging}
        tabIndex={disabled ? -1 : 0}
        role='slider'
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        aria-label={ariaLabel ?? 'Slider'}
        aria-orientation='horizontal'
        onKeyDown={handleThumbKeyDown}
      />
      <SC.ValueBubble $percentage={percentage}>{value}</SC.ValueBubble>
    </SC.SliderWrapper>
  )
}

export default Slider
