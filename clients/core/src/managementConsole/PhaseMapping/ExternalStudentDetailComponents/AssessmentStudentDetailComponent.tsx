import { CoursePhaseStudentIdentifierProps } from '../PhaseStudentDetailMapping'
import { safeFederatedLazyStudentDetail } from '../utils/safeFederatedLazy'

export const AssessmentStudentDetailComponent =
  safeFederatedLazyStudentDetail<CoursePhaseStudentIdentifierProps>(
    () => import('assessment_component/provide'),
    () => <>server unavailable</>,
  )
