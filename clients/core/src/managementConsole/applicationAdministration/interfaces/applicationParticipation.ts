import { PassStatus } from '@tumaet/prompt-shared-state'
import { Student } from '@tumaet/prompt-shared-state'

export interface ApplicationParticipation {
  id: string
  passStatus: PassStatus
  metaData: { [key: string]: any }
  student: Student
  score: number | null
}
