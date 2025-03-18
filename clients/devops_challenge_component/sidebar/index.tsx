import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { Role } from '@tumaet/prompt-shared-state'
import { GitBranch } from 'lucide-react'

const sidebarItems: SidebarMenuItemProps = {
  title: 'DevOps Challenge',
  icon: <GitBranch />,
  goToPath: '',
  subitems: [
    {
      title: 'Settings',
      goToPath: '/settings',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
    {
      title: 'Test',
      goToPath: '/Test',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    }
  ],
}

export default sidebarItems
