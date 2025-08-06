import { useMemo } from 'react'

import { AssessmentParticipationWithStudent } from '../../../../interfaces/assessmentParticipationWithStudent'
import { ScoreLevelWithParticipation } from '../../../../interfaces/scoreLevelWithParticipation'
import { AssessmentCompletion } from '../../../../interfaces/assessmentCompletion'
import { Assessment } from '../../../../interfaces/assessment'

import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'

export const useGetParticipationsWithAssessment = (
  participations: AssessmentParticipationWithStudent[],
  participationsWithScore: ScoreLevelWithParticipation[],
  assessmentCompletions: AssessmentCompletion[],
  assessments: Assessment[],
) => {
  return useMemo<ParticipationWithAssessment[]>(() => {
    const temp = participationsWithScore
      .map((participationWithScore) => {
        const participation = participations.find(
          (p) => p.courseParticipationID === participationWithScore.courseParticipationID,
        )
        const completion = assessmentCompletions.find(
          (c) => c.courseParticipationID === participationWithScore.courseParticipationID,
        )

        return {
          participation,
          assessments: assessments.filter(
            (a) => a.courseParticipationID === participationWithScore.courseParticipationID,
          ),
          scoreLevel: participationWithScore.scoreLevel,
          scoreNumeric: participationWithScore.scoreNumeric,
          assessmentCompletion: completion,
        } as ParticipationWithAssessment
      })
      .filter((p) => p.participation !== undefined)
    return temp
  }, [participations, participationsWithScore, assessmentCompletions, assessments])
}
