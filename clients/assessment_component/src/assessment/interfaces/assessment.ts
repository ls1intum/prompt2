import { CompetencyScore } from './competencyScore'
import { ScoreLevel } from './scoreLevel'

export type Assessment = CompetencyScore & {
  examples: string
  comment: string
  assessedAt: string // ISO 8601 date string
  author: string
}

export type CreateOrUpdateAssessmentRequest = {
  courseParticipationID: string // UUID
  coursePhaseID: string // UUID
  competencyID: string // UUID
  scoreLevel: ScoreLevel
  examples: string
  comment: string
  author: string
}

export type AssessmentCompletion = {
  courseParticipationID: string // UUID
  coursePhaseID: string // UUID
  completedAt: string // ISO 8601 date string
  author: string
  completed: boolean
  comment: string
  gradeSuggestion: number
}

export type CreateOrUpdateAssessmentCompletionRequest = {
  courseParticipationID: string // UUID
  coursePhaseID: string // UUID
  author: string
  comment: string
  gradeSuggestion: number
  completed?: boolean
}
