import { TemplateComponentOverviewPage } from 'template_component/src/OverviewPage'
import { TemplateComponentSettingsPage } from 'template_component/src/SettingsPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { TemplateComponentParticipantsPage } from 'src/ParticipantsPage'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: <TemplateComponentOverviewPage />,
    requiredPermissions: [], // empty means no permissions required
  },
  {
    path: '/participants',
    element: <TemplateComponentParticipantsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/settings',
    element: <TemplateComponentSettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default routes
