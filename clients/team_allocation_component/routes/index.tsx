import { Role } from '@tumaet/prompt-shared-state'
import OverviewPage from '../src/OverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'

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
]

export default routes
