import { Role } from '@tumaet/prompt-shared-state'
import { SurveySettingsPage } from '../src/team_allocation/pages/SurveySettings/SurveySettingsPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import OverviewPage from '../src/OverviewPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
    requiredPermissions: [
      Role.PROMPT_ADMIN,
      Role.COURSE_LECTURER,
      Role.COURSE_EDITOR,
      Role.COURSE_STUDENT,
    ],
  },
  {
    path: '/settings',
    element: <SurveySettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export default routes
