import { AssessmentType } from './assessmentType'
import { CompetencyScoreCompletion } from './competencyScoreCompletion'

export type EvaluationCompletion = CompetencyScoreCompletion & {
  authorCourseParticipationID: string
  type: AssessmentType
}

export type EvaluationCompletionRequest = {
  courseParticipationID: string
  coursePhaseID: string
  authorCourseParticipationID: string
  type: AssessmentType
}
