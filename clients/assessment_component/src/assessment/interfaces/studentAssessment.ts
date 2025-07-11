import { Assessment } from './assessment'
import { AssessmentCompletion } from './assessmentCompletion'
import { StudentScore } from './studentScore'

export type StudentAssessment = {
  courseParticipationID: string // UUID
  assessments: Assessment[]
  assessmentCompletion: AssessmentCompletion
  studentScore: StudentScore
}
