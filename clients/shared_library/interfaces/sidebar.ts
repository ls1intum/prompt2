export interface SidebarMenuItemProps {
  goToPath: string
  icon: JSX.Element
  title: string
  subitems?: {
    goToPath: string
    title: string
  }[]
}
