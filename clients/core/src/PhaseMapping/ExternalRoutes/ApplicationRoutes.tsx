import { ExtendedRouteObject } from '@/interfaces/extended_route_object'
import { Role } from '@/interfaces/permission_roles'
import { ApplicationLandingPage } from '../../ApplicationAdministration/pages/ApplicationLandingPage/ApplicationLandingPage'
import { ApplicationConfiguration } from '../../ApplicationAdministration/pages/ApplicationConfiguration/ApplicationConfiguration'
import { ExternalRoutes } from './ExternalRoutes'
import { ApplicationsAssessment } from '../../ApplicationAdministration/pages/ApplicationAssessment/ApplicationsAssessment'
import { ApplicationMailingSettings } from '../../ApplicationAdministration/pages/Mailing/ApplicationMailingSettings'

const applicationRoutesObjects: ExtendedRouteObject[] = [
  {
    path: '',
    element: <ApplicationLandingPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR], // empty means no permissions required
  },
  {
    path: '/configuration',
    element: <ApplicationConfiguration />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/applications',
    element: <ApplicationsAssessment />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/mailing',
    element: <ApplicationMailingSettings />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export const ApplicationRoutes = (): JSX.Element => {
  return <ExternalRoutes routes={applicationRoutesObjects} />
}
