import { ScoreLevel } from './scoreLevel'

export type Assessment = {
  id: string // UUID
  courseParticipationID: string // UUID
  coursePhaseID: string // UUID
  competencyID: string // UUID
  score: ScoreLevel
  comment: string
  assessedAt: string // ISO 8601 date string
  author: string
}

export type CreateOrUpdateAssessmentRequest = {
  courseParticipationID: string // UUID
  coursePhaseID: string // UUID
  competencyID: string // UUID
  score: ScoreLevel
  comment: string
  author: string
}

export type CategoryWithRemainingAssessments = {
  categoryID: string
  remainingAssessments: number
}

export type RemainingAssessmentsForStudent = {
  remainingAssessments: number
  categories: CategoryWithRemainingAssessments[]
}

export type AssessmentCompletion = {
  coursePhaseID: string // UUID
  courseParticipationID: string // UUID
  completedAt: string // ISO 8601 date string
  author: string
  completed: boolean
}
