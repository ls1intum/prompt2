import { useMemo } from 'react'

import { AssessmentParticipationWithStudent } from '../../../../interfaces/assessmentParticipationWithStudent'
import { ScoreLevelWithParticipation } from '../../../../interfaces/scoreLevelWithParticipation'
import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'
import { AssessmentCompletion } from '../../../../interfaces/assessmentCompletion'
import { Assessment } from '../../../../interfaces/assessment'

export const useGetParticipantionsWithAssessment = (
  participants: AssessmentParticipationWithStudent[],
  scoreLevels: ScoreLevelWithParticipation[],
  assessmentCompletions: AssessmentCompletion[],
  assessments: Assessment[],
) => {
  return useMemo<ParticipationWithAssessment[]>(() => {
    return (
      participants.map((participation) => {
        const participationAssessments =
          assessments.filter(
            (assessment) =>
              assessment.courseParticipationID === participation.courseParticipationID,
          ) ?? []

        if (!scoreLevels || scoreLevels.length === 0) {
          return {
            participation,
            scoreLevel: undefined,
            assessmentCompletion: undefined,
            assessments: participationAssessments,
          }
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

        return {
          participation,
          scoreLevel: scoreLevel?.scoreLevel,
          assessmentCompletion,
          assessments: participationAssessments,
        }
      }) || []
    )
  }, [participants, scoreLevels, assessmentCompletions, assessments])
}
