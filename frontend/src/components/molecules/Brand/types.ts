export type TBrandSize = 'sm' | 'md' | 'lg'

export interface IBrandProps {
  /** Visible brand name text (defaults to "DermaTrack") */
  name?: string
  /** Optional path to a logo asset in /public (e.g. "/logo.png"). If not provided, a fallback monogram is used */
  logoSrc?: string
  /** Visual size of the logo + text bundle */
  size?: TBrandSize
  /** Whether to render the textual brand name next to the icon (defaults to true) */
  showName?: boolean
  /** Optional click handler (usually to navigate home) */
  onClick?: () => void
  /** Accessible label if clickable */
  ariaLabel?: string
}
