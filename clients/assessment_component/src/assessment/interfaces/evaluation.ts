import { CompetencyScore } from './competencyScore'
import { ScoreLevel } from './scoreLevel'

export type Evaluation = CompetencyScore & {
  authorCourseParticipationID: string
  evaluatedAt: string
}

export type CreateOrUpdateEvaluationRequest = {
  courseParticipationID: string
  competencyID: string
  scoreLevel: ScoreLevel
  authorCourseParticipationID: string
}
