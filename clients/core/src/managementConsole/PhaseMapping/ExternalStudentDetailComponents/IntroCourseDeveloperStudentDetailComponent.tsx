import { CoursePhaseStudentIdentifierProps } from '../PhaseStudentDetailMapping'
import { safeFederatedLazyStudentDetail } from '../utils/safeFederatedLazy'

export const IntroCourseDeveloperStudentDetailComponent =
  safeFederatedLazyStudentDetail<CoursePhaseStudentIdentifierProps>(
    () => import('intro_course_developer_component/provide'),
    () => <></>,
  )
