import { Role } from '@tumaet/prompt-shared-state'
import { SurveySettingsPage } from '../src/team_allocation/pages/SurveySettings/SurveySettingsPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { StudentSurveyPage } from '../src/team_allocation/pages/StudentSurvey/StudentSurveyPage'
import { TeamAllocationPage } from '../src/team_allocation/pages/TeamAllocation/TeamAllocationPage'

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
    path: '/allocations',
    element: <TeamAllocationPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/settings',
    element: <SurveySettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export default routes
