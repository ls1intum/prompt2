import { PassStatus } from './course_phase_participation'
import { Student } from './student'

export interface ApplicationParticipation {
  id: string
  pass_status: PassStatus
  meta_data: { [key: string]: any }
  student: Student
  score: number | null
}
