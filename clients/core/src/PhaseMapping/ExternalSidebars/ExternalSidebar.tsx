import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { useAuthStore } from '@/zustand/useAuthStore'
import { InsideSidebarMenuItem } from '../../Sidebar/InsideSidebar/components/InsideSidebarMenuItem'
import { getPermissionString } from '@/interfaces/permission_roles'
import { useCourseStore } from '@/zustand/useCourseStore'
import { useParams } from 'react-router-dom'

interface ExternalSidebarProps {
  rootPath: string
  title?: string
  sidebarElement: SidebarMenuItemProps
}

export const ExternalSidebarComponent: React.FC<ExternalSidebarProps> = ({
  title,
  rootPath,
  sidebarElement,
}: ExternalSidebarProps) => {
  // Example of using a custom hook
  const { permissions } = useAuthStore() // Example of calling your custom hook
  const { courses } = useCourseStore()
  const courseId = useParams<{ courseId: string }>().courseId

  const course = courses.find((c) => c.id === courseId)

  let hasComponentPermission = false
  if (sidebarElement.requiredPermissions) {
    hasComponentPermission = sidebarElement.requiredPermissions.some((role) => {
      permissions.includes(getPermissionString(role, course?.name, course?.semester_tag))
    })
  } else {
    // no permissions required
    hasComponentPermission = true
  }

  return (
    <>
      {hasComponentPermission && (
        <InsideSidebarMenuItem
          title={title || sidebarElement.title}
          icon={sidebarElement.icon}
          goToPath={rootPath + sidebarElement.goToPath}
          subitems={
            sidebarElement.subitems
              ?.filter((subitem) => {
                const hasPermission = subitem.requiredPermissions?.some((role) => {
                  return permissions.includes(
                    getPermissionString(role, course?.name, course?.semester_tag),
                  )
                })
                if (subitem.requiredPermissions && !hasPermission) {
                  return false
                } else {
                  return true
                }
              })
              .map((subitem) => {
                return {
                  title: subitem.title,
                  goToPath: rootPath + subitem.goToPath,
                }
              }) || []
          }
        />
      )}
    </>
  )
}
