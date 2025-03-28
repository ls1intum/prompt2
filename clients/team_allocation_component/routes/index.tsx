import { Role } from '@tumaet/prompt-shared-state'
import { SurveySettingsPage } from '../src/team_allocation/pages/SurveySettings/SurveySettingsPage'
import OverviewPage from '../src/OverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
    requiredPermissions: [],
  },
  {
    path: '/settings',
    element: <SurveySettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export default routes
