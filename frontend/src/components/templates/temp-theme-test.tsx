'use client'
import { useTheme } from '@/hooks/use-theme'

const TempThemeTest = () => {
  const { toggleTheme } = useTheme()
  const handleClick = () => {
    toggleTheme()
  }
  return (
    <div>
      Hello World
      <button onClick={handleClick}>theme Toggle</button>
    </div>
  )
}
export default TempThemeTest
