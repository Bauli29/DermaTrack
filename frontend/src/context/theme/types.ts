import { DefaultTheme } from 'styled-components'

import { TThemeName } from '@/lib/themes'

export interface IThemeContextType {
  theme: DefaultTheme
  themeName: TThemeName
  toggleTheme: () => void
  setTheme: (themeName: TThemeName) => void
}
