import { ScoreLevel } from './scoreLevel'

export type Assessment = {
  id: string // UUID
  courseParticipationID: string // UUID
  coursePhaseID: string // UUID
  competencyID: string // UUID
  scoreLevel: ScoreLevel
  comment: string
  assessedAt: string // ISO 8601 date string
  author: string
}

export type CreateOrUpdateAssessmentRequest = {
  courseParticipationID: string // UUID
  coursePhaseID: string // UUID
  competencyID: string // UUID
  scoreLevel: ScoreLevel
  comment: string
  author: string
}

export type AssessmentCompletion = {
  coursePhaseID: string // UUID
  courseParticipationID: string // UUID
  completedAt: string // ISO 8601 date string
  author: string
  completed: boolean
}
