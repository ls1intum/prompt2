import { Role } from './permission_roles'

export interface SidebarMenuItemProps {
  goToPath: string
  icon: JSX.Element
  title: string
  requiredPermissions?: Role[]
  subitems?: {
    goToPath: string
    title: string
    requiredPermissions?: Role[]
  }[]
}
