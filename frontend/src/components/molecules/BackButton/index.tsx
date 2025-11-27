'use client'

import { useRouter } from 'next/navigation'
import * as SC from './styles'
import type { IBackButtonProps } from './types'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

/**
 * BackButton molecule
 * -------------------
 * Combines an icon with a small text label and performs a client-side navigation
 * to a given `href`. If `href` is not provided, `router.back()` is used.
 *
 * This is designed to look and feel like a native mobile back affordance.
 */
const BackButton = ({ href, label = 'Back', onClick }: IBackButtonProps) => {
  const router = useRouter()

  const handleClick = () => {
    onClick?.()
    if (href) router.push(href)
    else router.back()
  }

  return (
    <SC.BackButtonWrapper
      onClick={handleClick}
      role='button'
      aria-label={`Go back to ${label}`}
    >
      <Icon name='chevron_left' size='lg' />
      <Text as='span' size='small' color='textSecondary' noSpacing>
        {label}
      </Text>
    </SC.BackButtonWrapper>
  )
}

export default BackButton
