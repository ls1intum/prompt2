import { Assessment, AssessmentCompletion } from './assessment'
import { StudentScore } from './studentScore'

export type StudentAssessment = {
  courseParticipationID: string // UUID
  assessments: Assessment[]
  assessmentCompletion: AssessmentCompletion
  studentScore: StudentScore
}
