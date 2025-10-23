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
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ITheme {}
}

// Export theme names for easier reference
export type TThemeName = 'light' | 'dark'

export const lightTheme: ITheme = {
  colors: {
    // Primary brand colors
    primary: '#2563eb',
    secondary: '#10b981',

    // Background colors
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',

    // Text colors
    text: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',

    // UI element colors
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    shadow: 'rgba(0, 0, 0, 0.1)',

    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Interactive colors
    hover: '#f3f4f6',
    active: '#e5e7eb',
    focus: '#93c5fd',

    // Medical/health specific colors
    healthy: '#22c55e',
    attention: '#f97316',
    critical: '#dc2626',
  },
}

export const darkTheme: ITheme = {
  colors: {
    // Primary brand colors
    primary: '#3b82f6',
    secondary: '#34d399',

    // Background colors
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',

    // Text colors
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',

    // UI element colors
    border: '#475569',
    borderLight: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',

    // Status colors
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',

    // Interactive colors
    hover: '#475569',
    active: '#64748b',
    focus: '#3b82f6',

    // Medical/health specific colors
    healthy: '#4ade80',
    attention: '#fb923c',
    critical: '#f87171',
  },
}
