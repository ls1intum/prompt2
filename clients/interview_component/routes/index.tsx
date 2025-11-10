import OverviewPage from '../src/interview/pages/Overview/OverviewPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { InterviewDataShell } from '../src/interview/pages/InterviewDataShell'
import { ProfileDetailPage } from '../src/interview/pages/ProfileDetail/ProfileDetailPage'
import { MailingPage } from '../src/interview/pages/Mailing/MailingPage'
import { QuestionConfiguration } from '../src/interview/pages/Settings/QuestionConfiguration'

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
  {
    path: '/mailing',
    element: (
      <InterviewDataShell>
        <MailingPage />
      </InterviewDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/settings',
    element: (
      <InterviewDataShell>
        <QuestionConfiguration />
      </InterviewDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
]

export default interviewRoutes
