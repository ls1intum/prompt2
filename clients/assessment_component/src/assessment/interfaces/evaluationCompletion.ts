import { CompetencyScoreCompletion } from './competencyScoreCompletion'

export type EvaluationCompletion = CompetencyScoreCompletion & {
  authorCourseParticipationID: string
}

export type CreateOrUpdateEvaluationCompletionRequest = {
  courseParticipationID: string
  coursePhaseID: string
  authorCourseParticipationID: string
  completed: boolean
}

export type EvaluationCompletionRequest = {
  courseParticipationID: string
  coursePhaseID: string
  authorCourseParticipationID: string
}
