import { Role } from '@tumaet/prompt-shared-state'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { TeamAllocationPage } from '../src/self_team_allocation/pages/TeamAllocation/TeamAllocationPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <TeamAllocationPage />,
    requiredPermissions: [
      Role.PROMPT_ADMIN,
      Role.COURSE_LECTURER,
      Role.COURSE_EDITOR,
      Role.COURSE_STUDENT,
    ],
  },
  // {
  //   path: '/settings',
  //   element: <SettingsPage />,
  //   requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  // },
]

export default routes
