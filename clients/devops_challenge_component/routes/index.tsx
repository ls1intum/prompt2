import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import GitHubPage from '../src/devops_challenge/pages/GitHub/GitHubPage'
import OverviewPage from 'src/devops_challenge/pages/Overview/OverviewPage'
import SettingsPage from 'src/devops_challenge/pages/SettingsPage/SettingsPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
    requiredPermissions: [], // empty means no permissions required
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
  {
    path: '/github',
    element: <GitHubPage />,
    requiredPermissions: [],
  },
]

export default routes
