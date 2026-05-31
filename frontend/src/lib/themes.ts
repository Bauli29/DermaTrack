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
    optionBg: string
    optionBgSelected: string
    optionBorder: string
    optionBorderSelected: string
    optionHoverBorder: string
    optionShadowSelected: string
    optionDisabledOpacity: number
    sectionBg: string
    sectionBorder: string
    subsectionBg: string
    subsectionBorderAccent: string
    title: string
    accentText: string
    label: string
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
    primary: '#4A90E2',
    secondary: '#A678DE',

    background: '#F9FAFB',
    surface: '#FFFFFF',
    card: '#eaf8f8',

    text: '#1A1A1A',
    textSecondary: '#4F4F4F',
    textMuted: '#888888',

    border: '#DDDDDD',
    borderLight: '#E9E9E9',
    shadow: '#0000001A',

    success: '#6CCB7C',
    warning: '#FFD166',
    error: '#E57373',
    info: '#5BC0EB',

    hover: '#E6F0FF',
    active: '#4A90E2',
    focus: '#9AC9FF',

    healthy: '#5AD66F',
    attention: '#F5A623',
    critical: '#D32F2F',

    optionBg: '#FFFFFF',
    optionBgSelected: '#eaf8f8',
    optionBorder: '#DDDDDD',
    optionBorderSelected: '#4A90E2',
    optionHoverBorder: '#E9E9E9',
    optionShadowSelected: '#0000001A',
    optionDisabledOpacity: 0.75,
    sectionBg: '#FFFFFF',
    sectionBorder: '#E9E9E9',

    subsectionBg: '#F1FAF9',
    subsectionBorderAccent: '#A8DADC',
    title: '#1A1A1A',
    accentText: '#6B8F8B',
    label: '#3F4A4A', // slightly stronger than textSecondary
  },
}

export const darkTheme: ITheme = {
  colors: {
    // Brand
    primary: '#6CB6FF', // softer + more modern blue
    secondary: '#C792EA',

    // Background layers
    background: '#0B0F14', // deeper, less gray
    surface: '#121821', // main surfaces
    card: '#18202A', // elevated cards

    // Text
    text: '#EAF2FF', // slightly cool white
    textSecondary: '#A9B4C2',
    textMuted: '#6B7785',

    // Borders (more visible, less muddy)
    border: '#263241',
    borderLight: '#344356',
    shadow: 'rgba(0, 0, 0, 0.5)',

    // Status
    success: '#4ADE80',
    warning: '#FACC15',
    error: '#FB7185',
    info: '#38BDF8',

    // Interaction
    hover: '#1A2330',
    active: '#6CB6FF',
    focus: '#93C5FD',

    // Medical
    healthy: '#22C55E',
    attention: '#F59E0B',
    critical: '#EF4444',

    optionBg: '#121821',
    optionBgSelected: '#1B2A3A',
    optionBorder: '#263241',
    optionBorderSelected: '#6CB6FF',
    optionHoverBorder: '#3A4A5F',
    optionShadowSelected: 'rgba(108, 182, 255, 0.25)',
    optionDisabledOpacity: 0.6,
    sectionBg: '#121821',
    sectionBorder: '#263241',

    accentText: '#8FA3A1',
    subsectionBg: '#16222E',
    subsectionBorderAccent: '#92d1ef',

    title: 'white',
    label: '#B8C4D6',
  },
}
