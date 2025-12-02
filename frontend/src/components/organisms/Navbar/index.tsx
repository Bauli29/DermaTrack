'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

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
    href: '/test',
    icon: 'science',
    label: 'Test',
    activePattern: /^\/test/,
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

  return (
    <SC.NavBar role='navigation' aria-label='Main navigation'>
      <SC.NavContent>
        {items.map(item => {
          const active = isActive(item)
          return (
            <SC.NavLink
              key={item.href}
              href={item.href}
              $isActive={active}
              aria-current={active ? 'page' : undefined}
            >
              <SC.NavIcon $isActive={active} aria-hidden='true'>
                {item.icon}
              </SC.NavIcon>
              <SC.NavLabel $isActive={active}>{item.label}</SC.NavLabel>
            </SC.NavLink>
          )
        })}
      </SC.NavContent>
    </SC.NavBar>
  )
}

export default NavBar
