import { DataExportPage } from '../src/matching/pages/DataExport/DataExportPage'
import { MatchingOverviewPage } from '../src/matching/MatchingOverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <MatchingOverviewPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/export',
    element: <DataExportPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/participants',
    element: <CoursePhaseParticipationsTablePage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default routes
