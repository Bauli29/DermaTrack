'use client'

import { useRouter } from 'next/navigation'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import Brand from '@/components/molecules/Brand'
import ThemeToggleButton from '@/components/molecules/ThemeToggleButton'

import { usePageTitle } from '@/hooks/use-page-title'

import * as SC from './styles'

import type { IHeaderProps } from './types'
const Header = ({
  showBrand = true,
  brandLogoSrc = '/logo.png',
  brandName = 'DermaTrack',
}: IHeaderProps) => {
  const router = useRouter()

  const { title, backLink, parentTitle } = usePageTitle()

  const onBrandClick = () => router.push('/')

  const handleBackClick = () => {
    if (backLink) router.push(backLink)
  }

  return (
    <SC.Header>
      <SC.Left>
        {backLink && (
          <SC.BackButton>
            <Button variant='ghost' onClick={handleBackClick}>
              <Icon name='chevron_left' size='lg' />
              <Text as='span' size='small' color='textSecondary' noSpacing>
                {parentTitle ?? 'Back'}
              </Text>
            </Button>
          </SC.BackButton>
        )}
      </SC.Left>

      <SC.Center>
        {/* Main page title (current location) */}
        <Headline as='h1' variant='h3' align='center' color='text' noSpacing>
          {title}
        </Headline>
      </SC.Center>

      <SC.Right>
        <ThemeToggleButton />
        {showBrand && (
          <Brand
            name={brandName}
            logoSrc={brandLogoSrc}
            size='lg'
            onClick={onBrandClick}
          />
        )}
      </SC.Right>
    </SC.Header>
  )
}

export default Header
