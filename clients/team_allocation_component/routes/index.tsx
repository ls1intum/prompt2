import OverviewPage from '../src/OverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
    requiredPermissions: [],
  },
]

export default routes
