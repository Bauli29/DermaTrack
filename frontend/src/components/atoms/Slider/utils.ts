import { ISliderRangeConfig } from './types'

const getStepPrecision = (value: number): number => {
  const [, fraction = ''] = value.toString().split('.')
  return fraction.length
}

export const normalizeSliderValue = (
  value: number,
  { min, max, step }: ISliderRangeConfig
): number => {
  const clampedValue = Math.min(Math.max(value, min), max)

  if (step <= 0) {
    return clampedValue
  }

  const stepsFromMin = Math.round((clampedValue - min) / step)
  const normalizedValue = min + stepsFromMin * step
  const precision = Math.max(
    getStepPrecision(min),
    getStepPrecision(step),
    getStepPrecision(max)
  )

  return Number(
    Math.min(Math.max(normalizedValue, min), max).toFixed(precision)
  )
}

export const getSliderPercentage = (
  value: number,
  { min, max }: Pick<ISliderRangeConfig, 'min' | 'max'>
): number => {
  if (max <= min) {
    return 0
  }

  return ((value - min) / (max - min)) * 100
}

export const getSliderValueFromClientX = (
  clientX: number,
  rect: Pick<DOMRect, 'left' | 'width'>,
  config: ISliderRangeConfig
): number => {
  if (rect.width <= 0) {
    return config.min
  }

  const percentage = Math.min(
    Math.max((clientX - rect.left) / rect.width, 0),
    1
  )
  const nextValue = config.min + percentage * (config.max - config.min)

  return normalizeSliderValue(nextValue, config)
}

export const getNextSliderValueForKey = (
  key: string,
  currentValue: number,
  config: ISliderRangeConfig
): number | null => {
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      return normalizeSliderValue(currentValue - config.step, config)
    case 'ArrowRight':
    case 'ArrowUp':
      return normalizeSliderValue(currentValue + config.step, config)
    case 'Home':
      return config.min
    case 'End':
      return config.max
    default:
      return null
  }
}
