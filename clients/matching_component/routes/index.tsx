import { MatchingOverviewPage } from '../src/matching/MatchingOverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <MatchingOverviewPage />,
    requiredPermissions: [], // empty means no permissions required
  },
  // Add more routes here as needed
]

export default routes
