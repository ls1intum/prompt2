import { Role } from '@tumaet/prompt-shared-state'

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
