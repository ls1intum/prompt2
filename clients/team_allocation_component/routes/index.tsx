import { Role } from '@tumaet/prompt-shared-state'
import { SurveySettingsPage } from '../src/team_allocation/pages/SurveySettings/SurveySettingsPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { StudentSurveyPage } from '../src/team_allocation/pages/StudentSurvey/StudentSurveyPage'
import { TeaseConfigPage } from '../src/team_allocation/pages/TeaseConfig/TeaseConfigPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <StudentSurveyPage />,
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
  {
    path: '/tease_config',
    element: <TeaseConfigPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export default routes
