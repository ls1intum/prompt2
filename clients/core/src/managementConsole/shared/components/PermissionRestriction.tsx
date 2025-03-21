import { useAuthStore, useCourseStore } from '@tumaet/prompt-shared-state'
import { Role, getPermissionString } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'
import UnauthorizedPage from '@/components/UnauthorizedPage'
import { useKeycloak } from '@core/keycloak/useKeycloak'

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
  const { courses, isStudentOfCourse } = useCourseStore()
  const courseId = useParams<{ courseId: string }>().courseId
  const { logout } = useKeycloak()

  // This means something /general
  if (!courseId) {
    // TODO: refine at later stage
    // has at least some prompt permission
    return <>{permissions.length > 0 ? children : <UnauthorizedPage onLogout={logout} />}</>
  }

  // in ManagementRoot is verified that this exists
  const course = courses.find((c) => c.id === courseId)

  let hasPermission = true
  if (requiredPermissions.length > 0) {
    hasPermission = requiredPermissions.some((role) => {
      return permissions.includes(getPermissionString(role, course?.name, course?.semesterTag))
    })

    // We need to compare student role with ownCourseIDs -> otherwise we could not hide pages from i.e. instructors
    // set hasPermission to true if the user is a student in the course and the page is accessible for students
    if (requiredPermissions.includes(Role.COURSE_STUDENT) && isStudentOfCourse(courseId)) {
      hasPermission = true
    }
  }

  return <>{hasPermission ? children : <UnauthorizedPage />}</>
}
