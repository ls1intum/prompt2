import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { ApplicationLandingPage } from '../../ApplicationAdministration/pages/ApplicationLandingPage/ApplicationLandingPage'
import { ApplicationConfiguration } from '../../ApplicationAdministration/pages/ApplicationConfiguration/ApplicationConfiguration'
import { ExternalRoutes } from './ExternalRoutes'
import { ApplicationsAssessment } from '../../ApplicationAdministration/pages/ApplicationAssessment/ApplicationsAssessment'
import { ApplicationMailingSettings } from '../../ApplicationAdministration/pages/Mailing/ApplicationMailingSettings'
import { ApplicationDataWrapper } from '../../ApplicationAdministration/components/ApplicationDataWrapper'

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
    path: '/applications',
    element: (
      <ApplicationDataWrapper>
        <ApplicationsAssessment />
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
