'use client'

import Image from 'next/image'
import * as SC from './styles'
import type { IBrandProps } from './types'
import Headline from '@/components/atoms/Headline'

/**
 * Brand molecule
 * -----------------
 * Purpose: Show the DermaTrack brand in a compact, reusable way.
 * - If a `logoSrc` is provided, it uses Next.js Image for optimized mobile delivery.
 * - Otherwise it falls back to a simple initial-based avatar circle with the text logo.
 * - The brand name is rendered using the existing Headline atom to stay consistent
 *   with the design tokens and typography ramp.
 *
 * Why a molecule?
 * - It combines two atoms (image/avatar + text) and layout/styling logic.
 */
const Brand = ({
  name = 'DermaTrack',
  logoSrc,
  size = 'md',
  showName = true,
  onClick,
  ariaLabel = 'Go to Home',
}: IBrandProps) => (
  <SC.BrandContainer
    role={onClick ? 'button' : undefined}
    onClick={onClick}
    aria-label={ariaLabel}
  >
    <SC.LogoBox $size={size}>
      {logoSrc ? (
        // Use a square box; the actual size is controlled by CSS via the wrapper
        <Image src={logoSrc} alt={name} fill sizes='40px' />
      ) : (
        <SC.FallbackAvatar aria-hidden>DT</SC.FallbackAvatar>
      )}
    </SC.LogoBox>
    {showName && (
      <Headline variant={size === 'lg' ? 'h3' : 'h4'} color='text' noSpacing>
        {name}
      </Headline>
    )}
  </SC.BrandContainer>
)

export default Brand
