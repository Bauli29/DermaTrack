'use client'

import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'
import { useAuth } from '@/hooks/use-auth'

import * as SC from './styles'

import type { IBottomNavProps, INavItem } from './types'

const NavItems: INavItem[] = [
  {
    href: '/',
    icon: 'home',
    label: 'Home',
    activePattern: /^\/$/,
  },
  {
    href: '/tracking/daily',
    icon: 'calendar_today',
    label: 'Tracking',
    activePattern: /^\/tracking/,
  },
  {
    href: '/statistics',
    icon: 'bar_chart',
    label: 'Statistics',
    activePattern: /^\/statistics/,
  },
  {
    href: '/login',
    icon: 'login',
    label: 'Login',
    activePattern: /^\/login/,
  },
]

const NavBar = ({ items = NavItems }: IBottomNavProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, isLoading, logout } = useAuth()

  // Memoize active state check to avoid recalculations
  const isActive = React.useCallback(
    (item: INavItem) => {
      if (item.activePattern) {
        return item.activePattern.test(pathname)
      }
      // Exact match for href
      return pathname === item.href
    },
    [pathname]
  )

  const handleLogout = React.useCallback(async () => {
    await logout()
    router.push('/login')
  }, [logout, router])

  // used from NavLink and NavActionButton
  const renderNavItemContent = React.useCallback(
    ({
      icon,
      label,
      active,
    }: {
      icon: string
      label: string
      active: boolean
    }) => (
      <>
        <Icon
          name={icon}
          color={active ? 'primary' : 'textSecondary'}
          size='lg'
          aria-hidden='true'
        />
        <Text
          as='span'
          size='small'
          color={active ? 'primary' : 'textSecondary'}
          weight={active ? 600 : 400}
          noSpacing
          truncate
        >
          {label}
        </Text>
      </>
    ),
    []
  )

  return (
    <SC.NavBar role='navigation' aria-label='Main navigation'>
      <SC.NavContent>
        {items.map(item => {
          if (item.href === '/login' && isLoggedIn) {
            return (
              <SC.NavActionButton
                key='logout'
                type='button'
                onClick={() => {
                  void handleLogout()
                }}
                disabled={isLoading}
                aria-label='Logout'
              >
                {renderNavItemContent({
                  icon: 'logout',
                  label: 'Logout',
                  active: false,
                })}
              </SC.NavActionButton>
            )
          }

          const active = isActive(item)
          return (
            <SC.NavLink
              key={item.href}
              href={item.href}
              $isActive={active}
              aria-current={active ? 'page' : undefined}
            >
              {renderNavItemContent({
                icon: item.icon,
                label: item.label,
                active,
              })}
            </SC.NavLink>
          )
        })}
      </SC.NavContent>
    </SC.NavBar>
  )
}

export default NavBar
