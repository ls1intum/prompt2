import OverviewPage from 'template_component/src/OverviewPage'
import SettingsPage from 'template_component/src/SettingsPage'
import { ExtendedRouteObject } from '@/interfaces/extended_route_object'
import { Role } from '@/interfaces/permission_roles'

const templateRoutes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
    requiredPermissions: [], // empty means no permissions required
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default templateRoutes
