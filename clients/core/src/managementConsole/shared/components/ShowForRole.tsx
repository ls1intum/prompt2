import { getPermissionString, Role, useAuthStore } from '@tumaet/prompt-shared-state'
import { PropsWithChildren } from 'react'

type CourseRole = Extract<Role, Role.COURSE_LECTURER | Role.COURSE_EDITOR | Role.COURSE_STUDENT>

interface ShowForRoleProps extends PropsWithChildren {
  roles: Role[]
  anyCourseRole?: CourseRole[]
}

export function ShowForRole({ roles, anyCourseRole = [], children }: ShowForRoleProps) {
  const { permissions } = useAuthStore()
  const globalAllowed = roles.some((r) => permissions.includes(getPermissionString(r)))
  const courseAllowed = anyCourseRole.some((r) => permissions.some((p) => p.endsWith(r)))

  return globalAllowed || courseAllowed ? <>{children}</> : <></>
}
