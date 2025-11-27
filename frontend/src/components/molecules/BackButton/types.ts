export interface IBackButtonProps {
  /** Optional href to navigate to; if not provided, we call router.back() */
  href?: string
  /** Small label shown next to the chevron (e.g., "Settings") */
  label?: string
  /** Optional callback fired before navigation */
  onClick?: () => void
}
