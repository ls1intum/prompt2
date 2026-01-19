import { CoursePhaseStudentIdentifierProps } from '../PhaseStudentDetailMapping'
import { safeFederatedLazyStudentDetail } from '../utils/safeFederatedLazy'

export const DevOpsStudentDetailComponent =
  safeFederatedLazyStudentDetail<CoursePhaseStudentIdentifierProps>(
    () => import('devops_challenge_component/provide'),
    () => <></>,
  )
