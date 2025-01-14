import OverviewPage from '../management/OverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extended_route_object'
import { Role } from '@/interfaces/permission_roles'

const interviewRoutes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default interviewRoutes
