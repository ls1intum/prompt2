import { Mic } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'

const templateSidebarItems: SidebarMenuItemProps = {
  title: 'Interview',
  icon: <Mic />,
  goToPath: '',
  subitems: [
    // {
    //   title: 'Settings',
    //   goToPath: '/settings',
    //   requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    // },
  ],
}

export default templateSidebarItems
