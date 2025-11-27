export interface IHeaderProps {
  /** Optional explicit title; if not provided, inferred from the URL segment */
  title?: string
  /** Show/hide brand on the right side */
  showBrand?: boolean
  /** Path to a logo in /public; defaults to '/logo-dermatrack.svg' */
  brandLogoSrc?: string
  /** Brand name text (next to logo) */
  brandName?: string
  /** Show/hide back button on the left side */
  showBack?: boolean
  /** Optional explicit back href; if omitted, computed parent path is used */
  backHref?: string
  /** Show the small breadcrumb/path row under the bar (off by default; useful on demo pages) */
  showPath?: boolean
  /** Optional className passthrough for styled overrides */
  className?: string
}
