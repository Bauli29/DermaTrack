'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import Brand from '@/components/molecules/Brand'
import BackButton from '@/components/molecules/BackButton'
import Headline from '@/components/atoms/Headline'
import Text from '@/components/atoms/Text'

import * as SC from './styles'
import type { IHeaderProps } from './types'

/**
 * Header organism (mobile-first)
 * --------------------------------
 * Responsibilities:
 * - Always show a recognizable brand (logo + app name) so users know they are
 *   on the official DermaTrack site/app.
 * - Show a context title for the current view (e.g., "Settings", "Profile").
 * - Provide a back button that points to the logical parent route. For example,
 *   when the current URL is `/settings/notification-preferances` the back target
 *   becomes `/settings`.
 *
 * Atomic Design Reasoning:
 * - This component is an organism because it composes multiple molecules/atoms
 *   (Brand + BackButton + Headline/Text) with layout and navigation logic.
 *
 * Usage guidance:
 * - Drop the Header at the top of pages or templates. It is sticky by default
 *   and respects iOS safe-area insets.
 * - You can override the inferred title and the computed back link using props.
 */
const Header: React.FC<IHeaderProps> = ({
  title,
  showBrand = true,
  brandLogoSrc = '/logo-dermatrack-mark.svg',
  brandName = 'DermaTrack',
  showBack = true,
  backHref,
  showPath = false,
  className,
}) => {
  const pathname = usePathname() ?? '/'
  const router = useRouter()

  // Split current path into segments, ignoring empty parts
  const segments = React.useMemo(
    () => pathname.split('/').filter(Boolean),
    [pathname]
  )

  // Compute the parent path (what the BackButton should navigate to)
  const computedParentPath = React.useMemo(() => {
    if (segments.length <= 1) return '/'
    const parentSegments = segments.slice(0, -1)
    return `/${parentSegments.join('/')}`
  }, [segments])

  // Pretty-print the current segment as a human-readable title if not provided
  const inferredTitle = React.useMemo(() => {
    const last = segments[segments.length - 1]
    if (!last) return 'Dashboard'
    return last.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }, [segments])

  // Label for the back button based on the parent segment (e.g., "Settings")
  const backLabel = React.useMemo(() => {
    if (segments.length <= 1) return 'Home'
    const parent = segments[segments.length - 2]
    return parent.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }, [segments])

  const onBrandClick = () => router.push('/')

  const isRoot = segments.length === 0
  const showBackButton = showBack && !isRoot

  return (
    <SC.HeaderBar className={className}>
      <SC.BarContent>
        <SC.LeftGroup>
          {showBackButton && (
            <BackButton
              href={backHref ?? computedParentPath}
              label={backLabel}
            />
          )}
        </SC.LeftGroup>

        <SC.CenterGroup>
          {/* Main page title (current location) */}
          <Headline as='h1' variant='h3' align='center' color='text' noSpacing>
            {title ?? inferredTitle}
          </Headline>
        </SC.CenterGroup>

        <SC.RightGroup>
          {showBrand && (
            <Brand
              name={brandName}
              logoSrc={brandLogoSrc}
              size={isRoot ? 'md' : 'sm'}
              showName={isRoot}
              onClick={onBrandClick}
            />
          )}
        </SC.RightGroup>
      </SC.BarContent>

      {/* Optional subtext showing full path for clarity on test/demo pages */}
      {showPath && (
        <SC.BreadcrumbRow aria-hidden>
          <Text as='span' size='small' color='textMuted' noSpacing>
            {pathname}
          </Text>
        </SC.BreadcrumbRow>
      )}
    </SC.HeaderBar>
  )
}

export default Header
