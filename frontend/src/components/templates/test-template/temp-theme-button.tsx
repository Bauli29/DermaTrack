'use client'
import { useTheme } from '@/hooks/use-theme'

const ThemeButton = () => {
  const { toggleTheme } = useTheme()
  const handleClick = () => {
    toggleTheme()
  }
  return <button onClick={handleClick}>Toggle Theme</button>
}

export default ThemeButton
