import { Assessment, RemainingAssessmentsForStudent, AssessmentCompletion } from './assessment'

export type StudentAssessment = {
  courseParticipationID: string // UUID
  assessments: Assessment[]
  remainingAssessments: RemainingAssessmentsForStudent
  assessmentCompletion: AssessmentCompletion
}
