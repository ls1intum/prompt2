import { ApplicationParticipation } from '../../../interfaces/applicationParticipation'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

/**
 * Converts ApplicationParticipation to CoursePhaseParticipationWithStudent
 * by adding empty prevData and studentReadableData fields
 */
export const convertApplicationToCoursePhaseParticipation = (
  application: ApplicationParticipation,
): CoursePhaseParticipationWithStudent => {
  return {
    ...application,
    prevData: {},
    studentReadableData: {},
  }
}
