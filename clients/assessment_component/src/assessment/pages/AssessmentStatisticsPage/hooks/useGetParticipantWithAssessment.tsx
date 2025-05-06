import { useMemo } from 'react'

import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { ScoreLevelWithParticipation } from '../../../interfaces/scoreLevelWithParticipation'
import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'

export const useGetParticipantionsWithAssessment = (
  participants: CoursePhaseParticipationWithStudent[],
  scoreLevels: ScoreLevelWithParticipation[],
) => {
  return useMemo<ParticipationWithAssessment[]>(() => {
    return (
      participants.map((participation) => {
        if (!scoreLevels || scoreLevels.length === 0) {
          return { participation, scoreLevel: undefined }
        }

        const scoreLevel =
          scoreLevels?.find(
            (devProfile) =>
              devProfile.courseParticipationID === participation.courseParticipationID,
          ) || undefined

        return { participation, scoreLevel: scoreLevel?.scoreLevel }
      }) || []
    )
  }, [participants, scoreLevels])
}
