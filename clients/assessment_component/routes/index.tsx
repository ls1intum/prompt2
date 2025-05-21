import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { SettingsPage } from '../src/assessment/pages/SettingsPage/SettingsPage'
import { AssessmentOverviewPage } from '../src/assessment/pages/AssessmentOverviewPage/AssessmentOverviewPage'
import { AssessmentPage } from '../src/assessment/pages/AssessmentPage/AssessmentPage'
import { AssessmentDataShell } from '../src/assessment/pages/AssessmentDataShell'
import { AssessmentStatisticsPage } from '../src/assessment/pages/AssessmentStatisticsPage/AssessmentStatisticsPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: (
      <AssessmentDataShell>
        <AssessmentOverviewPage />
      </AssessmentDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR],
  },
  {
    path: '/student-assessment/:courseParticipationID',
    element: (
      <AssessmentDataShell>
        <AssessmentPage />
      </AssessmentDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR],
  },
  {
    path: '/statistics',
    element: (
      <AssessmentDataShell>
        <AssessmentStatisticsPage />
      </AssessmentDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/settings',
    element: (
      <AssessmentDataShell>
        <SettingsPage />
      </AssessmentDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN],
  },
]

export default routes
