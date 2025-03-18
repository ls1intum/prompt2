import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import ChallengePage from '../src/devops_challenge/pages/ChallengePage'
import SettingsPage from '../src/devops_challenge/pages/SettingsPage/SettingsPage'
import StudentRepoForm from '../src/devops_challenge/components/StudentRepoForm'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <ChallengePage />,
    requiredPermissions: [], // empty means no permissions required
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/Test',
    element: <StudentRepoForm />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  }
  // Add more routes here as needed
]

export default routes
