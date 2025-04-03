import { useMemo } from 'react'

import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { Assessment } from '../../../interfaces/assessment'

export const useGetParticipationsWithAssessments = (
  participants: CoursePhaseParticipationWithStudent[],
  assessments: Assessment[],
) => {
  return useMemo(() => {
    return (
      console.log('participants', participants),
      participants.map((participation) => {
        if (!assessments || assessments.length === 0) {
          return { participation, profile: undefined }
        }

        const profile =
          assessments?.find(
            (assessment) =>
              assessment.courseParticipationID === participation.courseParticipationID,
          ) || undefined

        return { participation, profile }
      }) || []
    )
  }, [participants, assessments])
}
