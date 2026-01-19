import { CoursePhaseStudentIdentifierProps } from '../PhaseStudentDetailMapping'
import { safeFederatedLazyStudentDetail } from '../utils/safeFederatedLazy'

export const IntroCourseTutorStudentDetailComponent =
  safeFederatedLazyStudentDetail<CoursePhaseStudentIdentifierProps>(
    () => import('intro_course_developer_component/provide'),
    () => <></>,
  )
