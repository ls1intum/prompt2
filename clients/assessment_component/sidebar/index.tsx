import { ClipboardList } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { Role } from '@tumaet/prompt-shared-state'

const sidebarItems: SidebarMenuItemProps = {
  title: 'Assessment Component',
  icon: <ClipboardList />,
  goToPath: '',
  requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR],
  subitems: [
    {
      title: 'Statistics',
      goToPath: '/statistics',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
    {
      title: 'Settings',
      goToPath: '/settings',
      requiredPermissions: [Role.PROMPT_ADMIN],
    },
  ],
}

export default sidebarItems
