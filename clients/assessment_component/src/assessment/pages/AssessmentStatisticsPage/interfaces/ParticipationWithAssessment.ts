import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

export interface ParticipationWithAssessment {
  participation: CoursePhaseParticipationWithStudent
  scoreLevel: ScoreLevel | undefined
}
