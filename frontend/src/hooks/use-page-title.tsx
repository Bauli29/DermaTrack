import { useContext } from 'react'
import { PageTitleContext } from '../context/page-title'

export const usePageTitle = () => {
  const context = useContext(PageTitleContext)
  if (!context)
    throw new Error('usePageTitle must be used within PageTitleProvider')
  return context
}
