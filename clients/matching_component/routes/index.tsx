import OverviewPage from '../management/OverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extended_route_object'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
    requiredPermissions: [], // empty means no permissions required
  },
  // Add more routes here as needed
]

export default routes
