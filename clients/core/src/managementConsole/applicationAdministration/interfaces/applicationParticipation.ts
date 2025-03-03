import { PassStatus } from '@tumaet/prompt-shared-state'
import { Student } from '@tumaet/prompt-shared-state'

export interface ApplicationParticipation {
  coursePhaseID: string
  courseParticipationID: string
  passStatus: PassStatus
  restrictedData: { [key: string]: any }
  student: Student
  score: number | null
}
