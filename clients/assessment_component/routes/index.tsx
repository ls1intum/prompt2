import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { SettingsPage } from '../src/assessment/pages/SettingsPage/SettingsPage'
import { AssessmentOverviewPage } from 'src/assessment/pages/AssessmentOverviewPage/AssessmentOverviewPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <AssessmentOverviewPage />,
    requiredPermissions: [], // empty means no permissions required
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default routes
