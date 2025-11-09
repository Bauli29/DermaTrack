export interface ITheme {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    card: string
    text: string
    textSecondary: string
    textMuted: string
    border: string
    borderLight: string
    shadow: string
    success: string
    warning: string
    error: string
    info: string
    hover: string
    active: string
    focus: string
    healthy: string
    attention: string
    critical: string
  }
}

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/naming-convention
  export interface DefaultTheme extends ITheme {}
}

// Export theme names for easier reference
export type TThemeName = 'light' | 'dark'

export const lightTheme: ITheme = {
  colors: {
    // Primary brand colors
    primary: '#4A90E2', // Soft blue (accessible on white + readable text)
    secondary: '#A678DE', // Pastel lavender

    // Background colors
    background: '#F9FAFB', // Gentle off-white background
    surface: '#FFFFFF', // White panels
    card: '#F0F2F5', // Slight contrast for cards

    // Text colors
    text: '#1A1A1A', // Near-black text
    textSecondary: '#4F4F4F', // Medium gray
    textMuted: '#888888', // Muted text

    // UI element colors
    border: '#DDDDDD', // Subtle border
    borderLight: '#E9E9E9',
    shadow: '#0000001A', // Light shadow

    // Status colors
    success: '#6CCB7C', // Soft green
    warning: '#FFD166', // Warm pastel yellow
    error: '#E57373', // Soft red
    info: '#5BC0EB', // Light cyan-blue

    // Interactive colors
    hover: '#E6F0FF', // Soft blue hover tint
    active: '#4A90E2', // Same as primary for consistency
    focus: '#9AC9FF', // Light blue focus ring

    // Medical/health specific colors
    healthy: '#5AD66F', // Green accent
    attention: '#F5A623', // Orange pastel
    critical: '#D32F2F', // Accessible dark red
  },
}

export const darkTheme: ITheme = {
  colors: {
    // Primary brand colors
    primary: '#5AB0FF', // Bright blue accent
    secondary: '#C58BFF', // Violet accent

    // Background colors
    background: '#0D1117', // Deep neutral dark
    surface: '#161B22', // Elevated surfaces
    card: '#1E242D',

    // Text colors
    text: '#E6E6E6', // Soft white text
    textSecondary: '#B3B3B3',
    textMuted: '#888888',

    // UI element colors
    border: '#2A2F37',
    borderLight: '#3C4149',
    shadow: '#00000066',

    // Status colors
    success: '#3DDC97', // Vibrant mint green
    warning: '#F4C430', // Warm gold
    error: '#FF6B6B', // Bright coral red
    info: '#4FC3F7',

    // Interactive colors
    hover: '#1C2330', // Slightly lighter surface
    active: '#5AB0FF',
    focus: '#FF9E9E', // Soft pink focus glow

    // Medical/health specific colors
    healthy: '#4ADE80', // Lime green
    attention: '#FFD166', // Yellow-orange
    critical: '#E84855', // Strong red-pink
  },
}
