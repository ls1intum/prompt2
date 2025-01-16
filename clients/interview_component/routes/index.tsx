import OverviewPage from '../management/OverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extended_route_object'
import { Role } from '@/interfaces/permission_roles'
import { InterviewDataShell } from '../management/InterviewDataShell'
import { ProfileDetailPage } from '../management/ProfileDetailPage'

const interviewRoutes: ExtendedRouteObject[] = [
  {
    path: '',
    element: (
      <InterviewDataShell>
        <OverviewPage />
      </InterviewDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/details/:studentId',
    element: (
      <InterviewDataShell>
        <ProfileDetailPage />
      </InterviewDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default interviewRoutes
