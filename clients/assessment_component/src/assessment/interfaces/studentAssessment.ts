import { Assessment, RemainingAssessmentsForStudent, AssessmentCompletion } from './assessment'
import { ScoreLevel } from './scoreLevel'

export type StudentAssessment = {
  courseParticipationID: string // UUID
  assessments: Assessment[]
  remainingAssessments: RemainingAssessmentsForStudent
  assessmentCompletion: AssessmentCompletion
  scoreLevel: ScoreLevel
}
