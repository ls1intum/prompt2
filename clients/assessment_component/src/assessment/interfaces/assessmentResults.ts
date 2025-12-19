import { ScoreLevel } from '@tumaet/prompt-shared-state'

import { Assessment } from './assessment'
import { AssessmentCompletion } from './assessmentCompletion'
import { ActionItem } from './actionItem'
import { StudentScore } from './studentScore'

export type AggregatedEvaluationResult = {
  competencyID: string
  averageScoreNumeric: number
  averageScoreLevel: ScoreLevel
  evaluationCount: number
}

export type StudentAssessmentResults = {
  courseParticipationID: string
  coursePhaseID: string
  assessmentCompletion: AssessmentCompletion
  assessments: Assessment[]
  studentScore: StudentScore
  peerEvaluationResults: AggregatedEvaluationResult[]
  selfEvaluationResults: AggregatedEvaluationResult[]
  actionItems?: ActionItem[]
}
