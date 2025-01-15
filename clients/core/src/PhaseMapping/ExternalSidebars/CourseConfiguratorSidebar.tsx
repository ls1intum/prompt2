import { Role } from '@/interfaces/permission_roles'
import { Settings } from 'lucide-react'
import { ExternalSidebarComponent } from './ExternalSidebar'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'

export const CourseConfiguratorSidebar = ({
  rootPath,
  title,
}: {
  rootPath: string
  title: string
}) => {
  const courseConfiguratorSidebarItems: SidebarMenuItemProps = {
    title: 'Configure Course',
    icon: <Settings />,
    goToPath: '/configurator',
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR],
  }
  return (
    <ExternalSidebarComponent
      title={title}
      rootPath={rootPath}
      sidebarElement={courseConfiguratorSidebarItems}
    />
  )
}
