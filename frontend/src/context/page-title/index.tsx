'use client'
import { IPageTitleContext } from './types'
import { createContext, useState, ReactNode } from 'react'

export const PageTitleContext = createContext<IPageTitleContext | undefined>(
  undefined
)

export const PageTitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState<string>('DermaTrack')
  const [backLink, setBackLink] = useState<string | null>(null)
  const [parentTitle, setParentTitle] = useState<string | null>(null)

  return (
    <PageTitleContext.Provider
      value={{
        title,
        setTitle,
        backLink,
        setBackLink,
        parentTitle,
        setParentTitle,
      }}
    >
      {children}
    </PageTitleContext.Provider>
  )
}
