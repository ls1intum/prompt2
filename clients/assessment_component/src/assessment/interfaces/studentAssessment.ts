import { Assessment } from './assessment'
import { AssessmentCompletion } from './assessmentCompletion'
import { StudentScore } from './studentScore'
import { Evaluation } from './evaluation'

export type StudentAssessment = {
  courseParticipationID: string // UUID
  assessments: Assessment[]
  assessmentCompletion: AssessmentCompletion
  studentScore: StudentScore
  selfEvaluations: Evaluation[]
  peerEvaluations: Evaluation[]
}
