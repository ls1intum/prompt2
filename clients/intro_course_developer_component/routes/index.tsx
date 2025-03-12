import { TutorImportPage } from '../src/introCourse/pages/TutorImport/TutorImportPage'
import { IntroCourseDataShell } from '../src/introCourse/IntroCourseDataShell'
import { IntroCoursePage } from '../src/introCourse/IntroCoursePage'
import SettingsPage from '../src/SettingsPage'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { Role } from '@tumaet/prompt-shared-state'
import { SeatAssignmentPage } from '../src/introCourse/pages/SeatAssignment/SeatAssignmentPage'

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
    path: '/settings',
    element: <SettingsPage />,
    requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
  },
  // Add more routes here as needed
]

export default routes
