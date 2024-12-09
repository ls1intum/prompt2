import { useAuthStore } from '@/zustand/useAuthStore'
import { Role, getPermissionString } from '@/interfaces/permission_roles'
import { useParams } from 'react-router-dom'
import { useCourseStore } from '@/zustand/useCourseStore'
import UnauthorizedPage from './components/UnauthorizedPage'

interface PermissionRestrictionProps {
  requiredPermissions: Role[]
  children: React.ReactNode
}

// The server will only return data which the user is allowed to see
// This is only needed if the user has to restrict permission further to not show some pages at all (i.e. settings pages)
export const PermissionRestriction = ({
  requiredPermissions,
  children,
}: PermissionRestrictionProps): JSX.Element => {
  const { permissions } = useAuthStore()
  const { courses } = useCourseStore()
  const courseId = useParams<{ courseId: string }>()

  // This means something /general
  if (!courseId) {
    // TODO: refine at later stage
    // has at least some prompt permission
    return <>{permissions.length > 0 ? children : <UnauthorizedPage />}</>
  }

  // in ManagementRoot is verified that this exists
  const course = courses.find((c) => c.id === courseId)

  const hasPermission = requiredPermissions.some((role) => {
    permissions.includes(getPermissionString(role, course?.name, course?.semester_tag))
  })

  // TODO: add is admin check

  return <>{hasPermission ? children : <UnauthorizedPage />}</>
}
