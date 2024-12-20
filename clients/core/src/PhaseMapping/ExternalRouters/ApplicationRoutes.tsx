import { ExtendedRouteObject } from '@/interfaces/extended_route_object'
import { Role } from '@/interfaces/permission_roles'
import { Application } from '../../Application/Application'
import { ApplicationConfiguration } from '../../Application/ApplicationConfiguration/ApplicationConfiguration'
import { ExternalRoutes } from './ExternalRoutes'

const applicationRoutesObjects: ExtendedRouteObject[] = [
  {
    path: '',
    element: <Application />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR], // empty means no permissions required
  },
  {
    path: '/configuration',
    element: <ApplicationConfiguration />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export const ApplicationRoutes = (): JSX.Element => {
  return <ExternalRoutes routes={applicationRoutesObjects} />
}
