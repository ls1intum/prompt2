import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { ScoreLevel } from '../../../interfaces/scoreLevel'
import { AssessmentCompletion } from '../../../interfaces/assessment'
import { Assessment } from '../../../interfaces/assessment'

export interface ParticipationWithAssessment {
  participation: CoursePhaseParticipationWithStudent
  scoreLevel: ScoreLevel | undefined
  assessmentCompletion: AssessmentCompletion | undefined
  assessments: Assessment[]
}
