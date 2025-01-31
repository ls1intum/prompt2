import { Role } from '@tumaet/prompt-shared-state'
import { FileUser } from 'lucide-react'
import { ExternalSidebarComponent } from './ExternalSidebar'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'

export const ApplicationSidebar = ({
  rootPath,
  title,
  coursePhaseID,
}: {
  rootPath: string
  title: string
  coursePhaseID: string
}) => {
  const applicationSidebarItems: SidebarMenuItemProps = {
    title: 'Application',
    icon: <FileUser />,
    goToPath: '',
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
    subitems: [
      {
        title: 'Applications',
        goToPath: '/applications',
        requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
      },
      {
        title: 'Configuration',
        goToPath: '/configuration',
        requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
      },
      {
        title: 'Mailing',
        goToPath: '/mailing',
        requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
      },
    ],
  }
  return (
    <ExternalSidebarComponent
      title={title}
      rootPath={rootPath}
      sidebarElement={applicationSidebarItems}
      coursePhaseID={coursePhaseID}
    />
  )
}
