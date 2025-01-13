import OverviewPage from 'template_component/src/OverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extended_route_object'
import { Role } from '@/interfaces/permission_roles'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
    requiredPermissions: [], // empty means no permissions required
  },
  // Add more routes here as needed
]

export default routes
