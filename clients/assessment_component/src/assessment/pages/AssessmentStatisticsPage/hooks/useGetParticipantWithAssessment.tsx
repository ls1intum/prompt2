import { useMemo } from 'react'

import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { ScoreLevelWithParticipation } from '../../../interfaces/scoreLevelWithParticipation'
import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'
import { AssessmentCompletion } from '../../../interfaces/assessment'

export const useGetParticipantionsWithAssessment = (
  participants: CoursePhaseParticipationWithStudent[],
  scoreLevels: ScoreLevelWithParticipation[],
  assessmentCompletions: AssessmentCompletion[],
) => {
  return useMemo<ParticipationWithAssessment[]>(() => {
    return (
      participants.map((participation) => {
        if (!scoreLevels || scoreLevels.length === 0) {
          return { participation, scoreLevel: undefined, assessmentCompletion: undefined }
        }

        const scoreLevel =
          scoreLevels?.find(
            (devProfile) =>
              devProfile.courseParticipationID === participation.courseParticipationID,
          ) || undefined

        const assessmentCompletion =
          assessmentCompletions?.find(
            (completion) =>
              completion.courseParticipationID === participation.courseParticipationID,
          ) || undefined

        return { participation, scoreLevel: scoreLevel?.scoreLevel, assessmentCompletion }
      }) || []
    )
  }, [participants, scoreLevels, assessmentCompletions])
}
