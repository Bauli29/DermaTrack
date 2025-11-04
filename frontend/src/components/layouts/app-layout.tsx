import { ReactNode } from 'react'

interface IAppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: IAppLayoutProps) => <div>{children}</div>

export default AppLayout
