import { Users2 } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { Role } from '@tumaet/prompt-shared-state'

const sidebarItems: SidebarMenuItemProps = {
  title: 'Team Allocation',
  icon: <Users2 />,
  goToPath: '',
  subitems: [
    {
      title: 'Allocations',
      goToPath: '/allocations',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
    {
      title: 'Survey Settings',
      goToPath: '/settings',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
  ],
}

export default sidebarItems
