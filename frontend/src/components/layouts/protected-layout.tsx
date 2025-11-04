import { ReactNode } from 'react'

interface IProtectedLayoutProps {
  children: ReactNode
}

const ProtectedLayout = ({ children }: IProtectedLayoutProps) => (
  <div>{children}</div>
)

export default ProtectedLayout
