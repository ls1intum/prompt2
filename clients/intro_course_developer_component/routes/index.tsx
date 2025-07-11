import { DeveloperProfilesLecturerPage } from '../src/introCourse/pages/DeveloperProfilesLecturer/DeveloperProfilesLecturerPage'
import { TutorImportPage } from '../src/introCourse/pages/TutorImport/TutorImportPage'
import { IntroCourseDataShell } from '../src/introCourse/IntroCourseDataShell'
import { IntroCoursePage } from '../src/introCourse/IntroCoursePage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { SeatAssignmentPage } from '../src/introCourse/pages/SeatAssignment/SeatAssignmentPage'
import { MailingPage } from '../src/introCourse/pages/Mailing/MailingPage'
import { CoursePhaseParticipants } from '../src/introCourse/pages/CoursePhaseParticipants/CoursePhaseParticipants'

const routes: ExtendedRouteObject[] = [
  {
    path: '',
    element: (
      <IntroCourseDataShell>
        <IntroCoursePage />
      </IntroCourseDataShell>
    ),
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_STUDENT], // empty means no permissions required
  },
  {
    path: '/participants',
    element: <CoursePhaseParticipants />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/developer-profiles',
    element: <DeveloperProfilesLecturerPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/tutors',
    element: <TutorImportPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/seat-assignments',
    element: <SeatAssignmentPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  {
    path: '/mailing',
    element: <MailingPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default routes
