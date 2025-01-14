import { Construction } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { Role } from '@/interfaces/permission_roles'

const sidebarItems: SidebarMenuItemProps = {
  title: 'TemplateComponent',
  icon: <Construction />,
  goToPath: '',
  subitems: [
    {
      title: 'Settings',
      goToPath: '/settings',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
  ],
}

export default sidebarItems
