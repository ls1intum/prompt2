import { Mic } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { Role } from '@tumaet/prompt-shared-state'

const interviewSidebarItems: SidebarMenuItemProps = {
  title: 'Interview',
  icon: <Mic />,
  goToPath: '',
  requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  subitems: [
    {
      title: 'Question Config',
      goToPath: '/question-configuration',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
    {
      title: 'Mailing',
      goToPath: '/mailing',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
  ],
}

export default interviewSidebarItems
