import { DataExportFlow } from '../src/matching/pages/DataExport/DataExportFlow'
import { MatchingOverviewPage } from '../src/matching/MatchingOverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <MatchingOverviewPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/export',
    element: <DataExportFlow />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default routes
