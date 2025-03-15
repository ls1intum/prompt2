import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'

export type DeveloperWithProfile = {
  participation: CoursePhaseParticipationWithStudent
  profile: DeveloperProfile | undefined
}
