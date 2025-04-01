import { Presentation } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { Role } from '@tumaet/prompt-shared-state'

const sidebarItems: SidebarMenuItemProps = {
  title: 'Intro Course',
  icon: <Presentation />,
  goToPath: '',
  requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_STUDENT],
  subitems: [
    {
      title: 'Participants',
      goToPath: '/participants',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
    {
      title: 'Developer Profiles',
      goToPath: '/developer-profiles',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
    {
      title: 'Tutor Import',
      goToPath: '/tutors',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
    {
      title: 'Seat Assignments',
      goToPath: '/seat-assignments',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
    {
      title: 'Mailing',
      goToPath: '/mailing',
      requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    },
  ],
}

export default sidebarItems
