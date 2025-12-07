'use client'
import { useEffect } from 'react'

import TestTemplate from '@/components/templates/test-template'

import { usePageTitle } from '@/hooks/use-page-title'

const Test = () => {
  const { setTitle, setBackLink, setParentTitle } = usePageTitle()

  useEffect(() => {
    setTitle('Test Page')
    setBackLink('/')
    setParentTitle('Dashboard')
  }, [setTitle, setBackLink, setParentTitle])

  return <TestTemplate />
}

export default Test
