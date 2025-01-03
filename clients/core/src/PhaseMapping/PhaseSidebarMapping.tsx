import { Role } from '@/interfaces/permission_roles'
import { TemplateSidebar } from './ExternalSidebars/TemplateSidebar'
import { FileUser } from 'lucide-react'
import { ExternalSidebarComponent } from './ExternalSidebars/ExternalSidebar'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'

const ApplicationSidebar = ({ rootPath, title }: { rootPath: string; title: string }) => {
  const applicationSidebarItems: SidebarMenuItemProps = {
    title: 'Application',
    icon: <FileUser />,
    goToPath: '',
    subitems: [
      {
        title: 'Configuration',
        goToPath: '/configuration',
        requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
      },
      {
        title: 'Applications',
        goToPath: '/applications',
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

export const PhaseSidebarMapping: { [key: string]: React.FC<{ rootPath: string; title: string }> } =
  {
    template_component: TemplateSidebar,
    Application: ApplicationSidebar,
  }
