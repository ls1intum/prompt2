import { AssessmentParticipationWithStudent } from '../../../../interfaces/assessmentParticipationWithStudent'
import { ScoreLevel } from '../../../../interfaces/scoreLevel'
import { AssessmentCompletion } from '../../../../interfaces/assessmentCompletion'
import { Assessment } from '../../../../interfaces/assessment'

export interface ParticipationWithAssessment {
  participation: AssessmentParticipationWithStudent
  assessments: Assessment[]
  scoreLevel: ScoreLevel
  scoreNumeric: number
  assessmentCompletion: AssessmentCompletion | undefined
}
