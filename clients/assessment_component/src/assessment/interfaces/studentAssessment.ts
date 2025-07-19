import { Assessment } from './assessment'
import { AssessmentCompletion } from './assessmentCompletion'
import { StudentScore } from './studentScore'
import { Evaluation } from './evaluation'
import { FeedbackItem } from './feedbackItem'

export type StudentAssessment = {
  courseParticipationID: string // UUID
  assessments: Assessment[]
  assessmentCompletion: AssessmentCompletion
  studentScore: StudentScore
  selfEvaluations: Evaluation[]
  peerEvaluations: Evaluation[]
  positiveFeedbackItems: FeedbackItem[]
  negativeFeedbackItems: FeedbackItem[]
}
