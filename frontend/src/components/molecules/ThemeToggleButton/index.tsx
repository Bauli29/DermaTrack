'use client'

import Icon from '@/components/atoms/Icon'

import { useTheme } from '@/hooks/use-theme'

import * as SC from './styles'

const ThemeToggleButton = () => {
  const { themeName, toggleTheme } = useTheme()

  const isDarkTheme = themeName === 'dark'
  const nextThemeLabel = isDarkTheme
    ? 'Switch to light mode'
    : 'Switch to dark mode'
  const iconName = isDarkTheme ? 'light_mode' : 'dark_mode'

  return (
    <SC.ToggleButton
      type='button'
      variant='ghost'
      size='md'
      onClick={toggleTheme}
      aria-label={nextThemeLabel}
      aria-pressed={isDarkTheme}
      title={nextThemeLabel}
    >
      <Icon name={iconName} size='md' color='inherit' aria-hidden='true' />
    </SC.ToggleButton>
  )
}

export default ThemeToggleButton
