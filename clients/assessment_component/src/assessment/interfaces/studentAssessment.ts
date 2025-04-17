import { Assessment, RemainingAssessmentsForStudent, AssessmentCompletion } from './assessment'
import { StudentScore } from './studentScore'

export type StudentAssessment = {
  courseParticipationID: string // UUID
  assessments: Assessment[]
  remainingAssessments: RemainingAssessmentsForStudent
  assessmentCompletion: AssessmentCompletion
  studentScore: StudentScore
}
