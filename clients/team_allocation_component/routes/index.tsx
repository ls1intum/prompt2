import { Role } from '@tumaet/prompt-shared-state'
import { SurveySettingsPage } from '../src/team_allocation/pages/SurveySettings/SurveySettingsPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { StudentSurveyPage } from '../src/team_allocation/pages/StudentSurvey/StudentSurveyPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <StudentSurveyPage />,
    requiredPermissions: [],
  },
  {
    path: '/settings',
    element: <SurveySettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export default routes
