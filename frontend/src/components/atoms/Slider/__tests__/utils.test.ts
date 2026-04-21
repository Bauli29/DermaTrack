import {
  getNextSliderValueForKey,
  getSliderPercentage,
  getSliderValueFromClientX,
  normalizeSliderValue,
} from '../utils'

describe('slider utils', () => {
  it('normalizes values to the configured step within range bounds', () => {
    expect(normalizeSliderValue(12, { min: 0, max: 10, step: 1 })).toBe(10)
    expect(normalizeSliderValue(2.24, { min: 0, max: 10, step: 0.5 })).toBe(2)
    expect(normalizeSliderValue(2.26, { min: 0, max: 10, step: 0.5 })).toBe(2.5)
  })

  it('normalizes values relative to the slider minimum for decimal ranges', () => {
    expect(normalizeSliderValue(-9.6, { min: -10, max: 40, step: 0.5 })).toBe(
      -9.5
    )
  })

  it('maps pointer positions to slider values and clamps outside the track', () => {
    const config = { min: 0, max: 10, step: 1 }
    const rect = { left: 100, width: 200 }

    expect(getSliderValueFromClientX(140, rect, config)).toBe(2)
    expect(getSliderValueFromClientX(90, rect, config)).toBe(0)
    expect(getSliderValueFromClientX(320, rect, config)).toBe(10)
  })

  it('calculates the rendered percentage and guards invalid ranges', () => {
    expect(getSliderPercentage(5, { min: 0, max: 10 })).toBe(50)
    expect(getSliderPercentage(5, { min: 1, max: 1 })).toBe(0)
  })

  it('returns the expected next value for supported keyboard controls', () => {
    const config = { min: 0, max: 10, step: 1 }

    expect(getNextSliderValueForKey('ArrowLeft', 5, config)).toBe(4)
    expect(getNextSliderValueForKey('ArrowDown', 0, config)).toBe(0)
    expect(getNextSliderValueForKey('ArrowRight', 9, config)).toBe(10)
    expect(getNextSliderValueForKey('ArrowUp', 10, config)).toBe(10)
    expect(getNextSliderValueForKey('Home', 7, config)).toBe(0)
    expect(getNextSliderValueForKey('End', 3, config)).toBe(10)
  })

  it('ignores unsupported keyboard input', () => {
    expect(
      getNextSliderValueForKey('Enter', 5, { min: 0, max: 10, step: 1 })
    ).toBeNull()
  })
})
