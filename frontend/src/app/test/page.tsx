'use client'
import { useEffect } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import TestTemplate from '@/components/templates/test-template'

const Test = () => {
  const { setTitle, setBackLink, setParentTitle } = usePageTitle()

  useEffect(() => {
    setTitle('Test Page')
    setBackLink('/')
    setParentTitle('Dashboard')
  }, [setTitle, setBackLink])

  return <TestTemplate />
}

export default Test
