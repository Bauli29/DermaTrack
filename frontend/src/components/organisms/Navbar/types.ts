export interface INavItem {
  href: string
  icon: string
  label: string
  // Match pattern for active state (optional)
  activePattern?: RegExp
}

export interface IBottomNavProps {
  items?: INavItem[]
}
