import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'
import { GitlabStatus } from '../../../interfaces/GitlabStatus'

export type ParticipationWithDevProfiles = {
  participation: CoursePhaseParticipationWithStudent
  devProfile: DeveloperProfile | undefined
  gitlabStatus: GitlabStatus | undefined
}
