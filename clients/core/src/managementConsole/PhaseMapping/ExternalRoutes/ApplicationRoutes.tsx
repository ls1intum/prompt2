import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { ApplicationLandingPage } from '../../applicationAdministration/pages/ApplicationLandingPage/ApplicationLandingPage'
import { ApplicationConfiguration } from '../../applicationAdministration/pages/ApplicationConfiguration/ApplicationConfiguration'
import { ExternalRoutes } from './ExternalRoutes'
import { ApplicationParticipantsPage } from '../../applicationAdministration/pages/ApplicationParticipantsPage/ApplicationParticipantsPage'
import { ApplicationParticipantsPage as ApplicationParticipantsPageRefactored } from '../../applicationAdministration/pages/ApplicationParticipantsPage/ApplicationParticipantsPageRefactored'
import { ApplicationMailingSettings } from '../../applicationAdministration/pages/Mailing/ApplicationMailingSettings'
import { ApplicationDataWrapper } from '../../applicationAdministration/components/ApplicationDataWrapper'

const applicationRoutesObjects: ExtendedRouteObject[] = [
  {
    path: '',
    element: (
      <ApplicationDataWrapper>
        <ApplicationLandingPage />
      </ApplicationDataWrapper>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR], // empty means no permissions required
  },
  {
    path: '/configuration',
    element: (
      <ApplicationDataWrapper>
        <ApplicationConfiguration />
      </ApplicationDataWrapper>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/participants',
    element: (
      <ApplicationDataWrapper>
        <ApplicationParticipantsPage />
      </ApplicationDataWrapper>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/participants-refactored',
    element: (
      <ApplicationDataWrapper>
        <ApplicationParticipantsPageRefactored />
      </ApplicationDataWrapper>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/mailing',
    element: (
      <ApplicationDataWrapper>
        <ApplicationMailingSettings />
      </ApplicationDataWrapper>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export const ApplicationRoutes = (): JSX.Element => {
  return <ExternalRoutes routes={applicationRoutesObjects} />
}
