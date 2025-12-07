export type TBrandSize = 'sm' | 'md' | 'lg'

export interface IBrandProps {
  /** Visible brand name text (defaults to "DermaTrack") */
  name?: string
  /** Optional path to a logo asset in /public (e.g. "/logo.png"). If not provided, a fallback monogram is used */
  logoSrc?: string
  /** Visual size of the logo + text bundle */
  size?: TBrandSize
  /** Optional click handler (usually to navigate home) */
  onClick?: () => void
  /** Accessible label if clickable */
  ariaLabel?: string
}
