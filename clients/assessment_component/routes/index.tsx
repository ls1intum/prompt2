import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'

import { SelfAndPeerAssessmentDataShell } from '../src/assessment/pages/SelfAndPeerAssessmentDataShell'
import { SelfAndPeerEvaluationPage } from '../src/assessment/pages/SelfAndPeerEvaluationPage/SelfAndPeerEvaluationPage'

import { AssessmentDataShell } from '../src/assessment/pages/AssessmentDataShell'
import { AssessmentOverviewPage } from '../src/assessment/pages/AssessmentOverviewPage/AssessmentOverviewPage'
import { AssessmentPage } from '../src/assessment/pages/AssessmentPage/AssessmentPage'
import { AssessmentStatisticsPage } from '../src/assessment/pages/AssessmentStatisticsPage/AssessmentStatisticsPage'
import { SettingsPage } from '../src/assessment/pages/SettingsPage/SettingsPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: (
      <SelfAndPeerAssessmentDataShell>
        <SelfAndPeerEvaluationPage />
      </SelfAndPeerAssessmentDataShell>
    ),
    requiredPermissions: [
      Role.PROMPT_ADMIN,
      Role.COURSE_LECTURER,
      Role.COURSE_EDITOR,
      Role.COURSE_STUDENT,
    ],
  },
  {
    path: '/overview',
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
