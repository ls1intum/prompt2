import { Mic } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { Role } from '@/interfaces/permission_roles'

const interviewSidebarItems: SidebarMenuItemProps = {
  title: 'Interview',
  icon: <Mic />,
  goToPath: '',
  requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  subitems: [
    {
      title: 'Mailing',
      goToPath: '/mailing',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
  ],
}

export default interviewSidebarItems
