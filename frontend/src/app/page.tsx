'use client'
import { useEffect } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'

const Home = () => {
  const { setTitle, setBackLink, setParentTitle } = usePageTitle()

  useEffect(() => {
    setTitle('Dashboard')
    setBackLink(null)
    setParentTitle(null)
  }, [setTitle, setBackLink])

  return <h1>Hello World</h1>
}

export default Home
