import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'

import { SelfAndPeerEvaluationDataShell } from '../src/assessment/pages/SelfAndPeerEvaluationDataShell'
import { SelfAndPeerEvaluationOverviewPage } from '../src/assessment/pages/SelfAndPeerEvaluationOverviewPage/SelfAndPeerEvaluationOverviewPage'
import { SelfEvaluationPage } from '../src/assessment/pages/SelfAndPeerEvaluationPage/SelfEvaluationPage'
import { PeerEvaluationPage } from '../src/assessment/pages/SelfAndPeerEvaluationPage/PeerEvaluationPage'

import { AssessmentDataShell } from '../src/assessment/pages/AssessmentDataShell'
import { AssessmentOverviewPage } from '../src/assessment/pages/AssessmentOverviewPage/AssessmentOverviewPage'
import { AssessmentPage } from '../src/assessment/pages/AssessmentPage/AssessmentPage'
import { AssessmentStatisticsPage } from '../src/assessment/pages/AssessmentStatisticsPage/AssessmentStatisticsPage'
import { SettingsPage } from '../src/assessment/pages/SettingsPage/SettingsPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: (
      <SelfAndPeerEvaluationDataShell>
        <SelfAndPeerEvaluationOverviewPage />
      </SelfAndPeerEvaluationDataShell>
    ),
    requiredPermissions: [
      Role.PROMPT_ADMIN,
      Role.COURSE_LECTURER,
      Role.COURSE_EDITOR,
      Role.COURSE_STUDENT,
    ],
  },
  {
    path: '/self-evaluation',
    element: (
      <SelfAndPeerEvaluationDataShell>
        <SelfEvaluationPage />
      </SelfAndPeerEvaluationDataShell>
    ),
    requiredPermissions: [
      Role.PROMPT_ADMIN,
      Role.COURSE_LECTURER,
      Role.COURSE_EDITOR,
      Role.COURSE_STUDENT,
    ],
  },
  {
    path: '/peer-evaluation/:courseParticipationID',
    element: (
      <SelfAndPeerEvaluationDataShell>
        <PeerEvaluationPage />
      </SelfAndPeerEvaluationDataShell>
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
    path: '/overview/:courseParticipationID',
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
