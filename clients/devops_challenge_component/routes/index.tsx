import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { DevOpsChallengePage } from '../src/devops_challenge/DevOpsChallengePage'
import { DevOpsChallengeDataShell } from '../src/devops_challenge/DevOpsChallengeDataShell'
import SettingsPage from '../src/devops_challenge/pages/SettingsPage/SettingsPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: (
      <DevOpsChallengeDataShell>
        <DevOpsChallengePage />
      </DevOpsChallengeDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_STUDENT],
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export default routes
