import { Role } from '@/interfaces/permission_roles'
import { FileUser } from 'lucide-react'
import { ExternalSidebarComponent } from './ExternalSidebar'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'

export const ApplicationSidebar = ({ rootPath, title }: { rootPath: string; title: string }) => {
  const applicationSidebarItems: SidebarMenuItemProps = {
    title: 'Application',
    icon: <FileUser />,
    goToPath: '',
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
    />
  )
}
