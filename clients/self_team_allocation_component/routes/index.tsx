import { Role } from '@tumaet/prompt-shared-state'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { SelfTeamAllocationPage } from '../src/self_team_allocation/pages/TeamAllocation/SelfTeamAllocationPage'
import { AllocationParticipants } from '../src/self_team_allocation/pages/AllocationParticipants/AllocationParticipantsPage'
import { SettingsPage } from '../src/self_team_allocation/pages/Settings/SettingsPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <SelfTeamAllocationPage />,
    requiredPermissions: [
      Role.PROMPT_ADMIN,
      Role.COURSE_LECTURER,
      Role.COURSE_EDITOR,
      Role.COURSE_STUDENT,
    ],
  },
  {
    path: '/participants',
    element: <AllocationParticipants />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export default routes
