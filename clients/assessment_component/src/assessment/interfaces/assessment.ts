import { CompetencyScore } from './competencyScore'
import { ScoreLevel } from '@tumaet/prompt-shared-state'

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
