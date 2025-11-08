'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import * as SC from './styles'
import { ISliderProps } from './types'

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
  ...props
}: ISliderProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Calculate percentage for positioning
  const percentage = ((value - min) / (max - min)) * 100

  // Clamp value within bounds and round to step
  const clampValue = useCallback(
    (val: number) => {
      const clamped = Math.min(Math.max(val, min), max)
      return Math.round(clamped / step) * step
    },
    [min, max, step]
  )

  // Calculate value from mouse position
  const calculateValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return value

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.min(
        Math.max((clientX - rect.left) / rect.width, 0),
        1
      )
      const newValue = min + percentage * (max - min)

      return clampValue(newValue)
    },
    [min, max, clampValue, value]
  )

  // Handle mouse/touch start
  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled) return

      const newValue = calculateValueFromPosition(clientX)
      setIsDragging(true)
      onChange(newValue)
    },
    [disabled, calculateValueFromPosition, onChange]
  )

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled) return

      const newValue = calculateValueFromPosition(clientX)
      onChange(newValue)
    },
    [isDragging, disabled, calculateValueFromPosition, onChange]
  )

  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
  }, [isDragging])

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
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

  // Setup global mouse/touch event listeners
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
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      $width={width}
      $maxWidth={maxWidth}
      $margin={margin}
      {...props}
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
      />
    </SC.SliderWrapper>
  )
}

export default Slider
