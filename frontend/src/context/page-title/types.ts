import { Dispatch, SetStateAction } from 'react'

export interface IPageTitleContext {
  title: string
  setTitle: Dispatch<SetStateAction<string>>
  backLink: string | null
  setBackLink: Dispatch<SetStateAction<string | null>>
  parentTitle: string | null
  setParentTitle: Dispatch<SetStateAction<string | null>>
}
