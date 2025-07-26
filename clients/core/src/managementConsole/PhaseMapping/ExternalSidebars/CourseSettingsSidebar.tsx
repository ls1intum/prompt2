import { Role } from '@tumaet/prompt-shared-state'
import { Settings } from 'lucide-react'
import { ExternalSidebarComponent } from './ExternalSidebar'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'

export const CourseSettingsSidebar = ({ rootPath, title }: { rootPath: string; title: string }) => {
  const courseConfiguratorSidebarItems: SidebarMenuItemProps = {
    title: 'Course Settings',
    icon: <Settings />,
    goToPath: '/settings',
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  }
  return (
    <ExternalSidebarComponent
      title={title}
      rootPath={rootPath}
      sidebarElement={courseConfiguratorSidebarItems}
    />
  )
}
